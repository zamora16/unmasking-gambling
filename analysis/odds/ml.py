"""Can machine learning beat the bookmaker?

Walk-forward evaluation: for every season from 2016/17 on, each model is fitted
on all earlier seasons and scored on that season only. Models:

- market:     closing odds with the margin removed (Shin)
- elo:        ordinal logit on the Elo difference
- logreg:     multinomial logistic regression on the form features
- gbm:        gradient-boosted trees on the same features
- gbm_market: gradient-boosted trees on the features plus the market odds

Hyperparameters are chosen once on a temporal hold-out (train 2001-2012,
validate 2013-2015) that never touches the test seasons.

    python analysis/odds/ml.py path/to/Matches.csv

Writes src/data/odds/ml.json.
"""
from __future__ import annotations

import itertools
import json
import sys
import time
from pathlib import Path

import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.impute import SimpleImputer
from sklearn.linear_model import LogisticRegression
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

sys.path.insert(0, str(Path(__file__).parent))
import margin_removal as mr  # noqa: E402
import pipeline as pl  # noqa: E402
from features import match_features  # noqa: E402

RNG = np.random.default_rng(20260926)
FIRST_TRAIN = 2001  # 2000/01 is warm-up for the rolling features
TEST_FROM = 2016
MARKET = ["mH", "mD", "mA", "margin"]
THRESHOLDS = [0.0, 0.02, 0.05, 0.10, 0.15, 0.25]

GROUPS = {
    "elo": ["HomeElo", "AwayElo", "elo_diff", "h_elo_trend5", "a_elo_trend5"],
    "form": [f"{s}_{c}{w}" for s in "ha" for c in ("pts", "gf", "ga") for w in (5, 20)] + ["d_pts5", "d_pts20", "d_gf20", "d_ga20"],
    "venue": ["h_venue_pts10", "h_venue_gd10", "a_venue_pts10", "a_venue_gd10", "d_venue_gd10"],
    "shots": [f"{s}_{c}10" for s in "ha" for c in ("sf", "sa", "tf", "ta")],
    "draws": ["h_draw20", "a_draw20"],
    "schedule": ["h_rest", "a_rest", "h_n_prev", "a_n_prev"],
    "league": ["div"],
}
FEATURES = [c for g in GROUPS.values() for c in g]


# ------------------------------------------------------------------- metrics
def per_match_ll(p: np.ndarray, y: np.ndarray) -> np.ndarray:
    return -np.log(np.clip(p[np.arange(len(y)), y], 1e-12, 1))


def rps(p: np.ndarray, y: np.ndarray) -> float:
    """Ranked probability score for ordered outcomes home < draw < away."""
    o = np.eye(3)[y]
    cp, co = np.cumsum(p, axis=1)[:, :2], np.cumsum(o, axis=1)[:, :2]
    return float(np.mean(np.sum((cp - co) ** 2, axis=1) / 2))


def boot_ci(x: np.ndarray, reps: int = 1000) -> tuple[float, float]:
    means = np.array([x[RNG.integers(0, len(x), len(x))].mean() for _ in range(reps)])
    return float(np.percentile(means, 2.5)), float(np.percentile(means, 97.5))


def skill_share(ll_base: np.ndarray, ll_model: np.ndarray, ll_market: np.ndarray, reps: int = 1000) -> tuple[float, float, float]:
    """Share of the market's log-loss improvement over base rates that the model
    recovers: 1 = as good as the market. Paired bootstrap over matches."""
    def share(i):
        return (ll_base[i].mean() - ll_model[i].mean()) / (ll_base[i].mean() - ll_market[i].mean())
    n = len(ll_base)
    boots = np.array([share(RNG.integers(0, n, n)) for _ in range(reps)])
    return float(share(np.arange(n))), float(np.percentile(boots, 2.5)), float(np.percentile(boots, 97.5))


# -------------------------------------------------------------------- models
def gbm(params: dict, cols: list[str] = FEATURES) -> HistGradientBoostingClassifier:
    return HistGradientBoostingClassifier(
        learning_rate=0.05, early_stopping=False, random_state=0,
        categorical_features=[cols.index("div")], **params,
    )


def logreg() -> object:
    num = [c for c in FEATURES if c != "div"]
    pre = ColumnTransformer([
        ("num", make_pipeline(SimpleImputer(strategy="median", add_indicator=True), StandardScaler()), num),
        ("div", OneHotEncoder(handle_unknown="ignore"), ["div"]),
    ])
    return make_pipeline(pre, LogisticRegression(C=1.0, max_iter=2000))


def fit_predict(kind: str, params: dict, tr: pd.DataFrame, te: pd.DataFrame, n_div: int) -> np.ndarray:
    if kind == "elo":
        theta = pl.fit_ordered_logit((tr.elo_diff / 100).to_numpy(), tr.y.to_numpy())
        return pl.predict_ordered_logit(theta, (te.elo_diff / 100).to_numpy())
    if kind == "logreg":
        m = logreg().fit(tr[FEATURES], tr.y)
        return m.predict_proba(te[FEATURES])
    cols = FEATURES + (MARKET if kind == "gbm_market" else [])
    m = gbm(params, cols)
    m.fit(tr[cols].to_numpy(dtype=float), tr.y)
    return m.predict_proba(te[cols].to_numpy(dtype=float))


def tune(df: pd.DataFrame, kind: str, n_div: int) -> dict:
    tr = df[(df.Season >= FIRST_TRAIN) & (df.Season <= 2012)]
    va = df[(df.Season >= 2013) & (df.Season < TEST_FROM)]
    grid = [dict(max_iter=it, max_leaf_nodes=lv, min_samples_leaf=ms, l2_regularization=1.0)
            for it, lv, ms in itertools.product([50, 100, 200, 400], [4, 8, 16], [200, 800])]
    scores = []
    for params in grid:
        p = fit_predict(kind, params, tr, va, n_div)
        scores.append(per_match_ll(p, va.y.to_numpy()).mean())
        print(f"  {kind} {params} -> {scores[-1]:.5f}")
    best = grid[int(np.argmin(scores))]
    return {"params": best, "grid": len(grid), "valLogLoss": pl.r(min(scores))}


# ----------------------------------------------------------- group importance
def group_importance(model_kind: str, params: dict, tr: pd.DataFrame, te: pd.DataFrame, n_div: int, sample: int = 40000) -> list[dict]:
    """Rise in log-loss when a whole feature group is shuffled together."""
    cols = FEATURES
    m = gbm(params).fit(tr[cols].to_numpy(dtype=float), tr.y)
    te = te.sample(min(sample, len(te)), random_state=1)
    X = te[cols].to_numpy(dtype=float)
    y = te.y.to_numpy()
    base = per_match_ll(m.predict_proba(X), y).mean()
    out = []
    for name, group in GROUPS.items():
        idx = [cols.index(c) for c in group]
        rises = []
        for _ in range(5):
            Xp = X.copy()
            Xp[:, idx] = Xp[RNG.permutation(len(Xp))][:, idx]
            rises.append(per_match_ll(m.predict_proba(Xp), y).mean() - base)
        out.append({"group": name, "rise": pl.r(float(np.mean(rises)), 5), "sd": pl.r(float(np.std(rises)), 5),
                    "rel": pl.r(float(np.mean(rises)) / base, 5), "relSd": pl.r(float(np.std(rises)) / base, 5), "n": len(group)})
    return sorted(out, key=lambda d: -d["rise"])


# ------------------------------------------------------------------- betting
def value_bets(te: pd.DataFrame, p: np.ndarray, odds_cols: list[str], thr: float) -> dict:
    odds = te[odds_cols].to_numpy()
    ev = p * odds - 1.0
    ev = np.where(np.isnan(ev), -np.inf, ev)
    pick = ev.argmax(axis=1)
    bet = ev.max(axis=1) > thr
    o = odds[np.arange(len(te)), pick][bet]
    won = pick[bet] == te.y.to_numpy()[bet]
    pnl = np.where(won, o - 1.0, -1.0)
    if len(pnl) < 30:
        return {"threshold": thr, "bets": int(len(pnl)), "roi": None, "lo": None, "hi": None, "winRate": None, "meanOdds": None}
    lo, hi = boot_ci(pnl, reps=1000)
    return {"threshold": thr, "bets": int(len(pnl)), "roi": pl.r(pnl.mean()), "lo": pl.r(lo), "hi": pl.r(hi),
            "winRate": pl.r(won.mean()), "meanOdds": pl.r(float(o.mean()), 2)}


# ---------------------------------------------------------------------- main
def main(path: str) -> None:
    t0 = time.time()
    raw = pd.read_csv(path, low_memory=False)
    raw["rid"] = np.arange(len(raw))
    feats = match_features(raw)
    df = pl.clean(raw).dropna(subset=["HomeElo", "AwayElo"])
    df = df.join(feats, on="rid")
    df["elo_diff"] = df.HomeElo - df.AwayElo
    divs = sorted(df.Division.unique())
    df["div"] = df.Division.map({d: i for i, d in enumerate(divs)}).astype(float)
    shin = mr.shin(df[pl.ODDS].to_numpy())[0]
    df[["mH", "mD", "mA"]] = shin
    df = df[df.Season >= FIRST_TRAIN].reset_index(drop=True)
    print(f"{len(df):,} matches with Elo and odds, features ready in {time.time() - t0:.0f}s")

    tuned = {k: tune(df, k, len(divs)) for k in ("gbm", "gbm_market")}
    print("tuned:", {k: v["params"] for k, v in tuned.items()})

    kinds = ["elo", "logreg", "gbm", "gbm_market"]
    preds = {k: [] for k in ["market"] + kinds}
    tests = []
    for s in range(TEST_FROM, int(df.Season.max()) + 1):
        tr, te = df[df.Season < s], df[df.Season == s]
        if len(te) == 0:
            continue
        tests.append(te)
        preds["market"].append(te[["mH", "mD", "mA"]].to_numpy())
        for k in kinds:
            params = tuned[k]["params"] if k in tuned else {}
            preds[k].append(fit_predict(k, params, tr, te, len(divs)))
        print(f"season {s}: {len(te):,} matches ({time.time() - t0:.0f}s)")
    te = pd.concat(tests, ignore_index=True)
    P = {k: np.vstack(v) for k, v in preds.items()}
    y = te.y.to_numpy()

    ll = {k: per_match_ll(p, y) for k, p in P.items()}
    base = np.bincount(df[df.Season < TEST_FROM].y, minlength=3) / (df.Season < TEST_FROM).sum()
    P_base = np.tile(base, (len(y), 1))
    scores = [{"model": "baseRates", "logLoss": pl.r(per_match_ll(P_base, y).mean()), "brier": pl.r(pl.brier(P_base, y)),
               "rps": pl.r(rps(P_base, y)), "acc": pl.r(float((P_base.argmax(1) == y).mean()))}]
    ll_base = per_match_ll(P_base, y)
    for k, p in P.items():
        d = ll[k] - ll["market"]
        lo, hi = boot_ci(d) if k != "market" else (0.0, 0.0)
        sh, sh_lo, sh_hi = skill_share(ll_base, ll[k], ll["market"]) if k != "market" else (1.0, 1.0, 1.0)
        scores.append({"model": k, "logLoss": pl.r(ll[k].mean()), "brier": pl.r(pl.brier(p, y)), "rps": pl.r(rps(p, y)),
                       "acc": pl.r(float((p.argmax(1) == y).mean())), "vsMarket": pl.r(float(d.mean()), 5),
                       "vsMarketLo": pl.r(lo, 5), "vsMarketHi": pl.r(hi, 5),
                       "share": pl.r(sh), "shareLo": pl.r(sh_lo), "shareHi": pl.r(sh_hi)})

    by_season = []
    for s, g in te.groupby("Season"):
        idx = g.index.to_numpy()
        by_season.append({"season": int(s), "n": int(len(g)), **{k: pl.r(ll[k][idx].mean()) for k in P}})

    betting = []
    for k in ("gbm", "gbm_market"):
        for thr in THRESHOLDS:
            betting.append({"model": k, "book": "reference", **value_bets(te, P[k], pl.ODDS, thr)})
        betting.append({"model": k, "book": "best", **value_bets(te.reset_index(drop=True), P[k], pl.BEST, 0.05)})

    last = int(te.Season.max())
    imp_te = df[df.Season.between(last - 2, last)]
    imp = group_importance("gbm", tuned["gbm"]["params"], df[df.Season < last - 2], imp_te, len(divs))

    out = {
        "trainFrom": FIRST_TRAIN,
        "testSeasons": [TEST_FROM, last],
        "nTest": int(len(te)),
        "nFeatures": len(FEATURES),
        "leagues": len(divs),
        "tuning": {k: {**v["params"], "grid": v["grid"], "valLogLoss": v["valLogLoss"]} for k, v in tuned.items()},
        "scores": scores,
        "bySeason": by_season,
        "calibration": {"gbm": pl.calibration(te, P["gbm"]), "market": pl.calibration(te, P["market"])},
        "importance": imp,
        "importanceSeasons": [last - 2, last],
        "betting": betting,
    }
    (pl.OUT / "ml.json").write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")))
    print(json.dumps({k: out[k] for k in ("scores", "importance")}, indent=1))
    print(json.dumps(betting, indent=1))
    print(f"wrote ml.json in {time.time() - t0:.0f}s")


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else str(pl.ROOT / "analysis" / "data" / "Matches.csv"))
