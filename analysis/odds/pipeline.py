"""Do the odds tell the truth?

Reproducible analysis of ~230,000 football matches (2000-2026) with pre-match
1X2 odds, results and Elo ratings. Produces the small JSON files that the
website's /cuotas page renders.

Data: Football-Data.co.uk, compiled by xgabora/Club-Football-Match-Data-2000-2025
(Elo from ClubElo). Download Matches.csv and pass its path:

    python analysis/odds/pipeline.py path/to/Matches.csv

Outputs go to src/data/odds/.
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import pandas as pd
from scipy.optimize import minimize
from scipy.stats import norm

sys.path.insert(0, str(Path(__file__).parent))
import margin_removal as mr  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "src" / "data" / "odds"
RNG = np.random.default_rng(20260925)

OUTCOMES = ["H", "D", "A"]
ODDS = ["OddHome", "OddDraw", "OddAway"]
BEST = ["MaxHome", "MaxDraw", "MaxAway"]

LEAGUE_NAMES = {
    "E0": "Premier League", "E1": "EFL Championship", "E2": "EFL League One", "E3": "EFL League Two",
    "EC": "National League", "SC0": "Scottish Premiership", "SC1": "Scottish Championship",
    "SC2": "Scottish League One", "SC3": "Scottish League Two", "D1": "Bundesliga", "D2": "2. Bundesliga",
    "SP1": "LaLiga", "SP2": "LaLiga 2", "I1": "Serie A", "I2": "Serie B", "F1": "Ligue 1", "F2": "Ligue 2",
    "N1": "Eredivisie", "B1": "Belgian Pro League", "P1": "Primeira Liga", "T1": "Süper Lig",
    "G1": "Greek Super League", "ARG": "Argentina Primera", "BRA": "Brasileirão", "USA": "MLS",
    "MEX": "Liga MX", "JAP": "J1 League", "CHN": "Chinese Super League", "RUS": "Russian Premier League",
    "SWE": "Allsvenskan", "NOR": "Eliteserien", "DEN": "Danish Superliga", "AUT": "Austrian Bundesliga",
    "SUI": "Swiss Super League", "POL": "Ekstraklasa", "ROM": "Romanian Liga I", "FIN": "Veikkausliiga",
    "IRL": "League of Ireland",
}


# --------------------------------------------------------------------------- load
def load(path: str) -> pd.DataFrame:
    df = pd.read_csv(path, low_memory=False)
    df = df.dropna(subset=ODDS + ["FTResult"])
    df = df[(df[ODDS] > 1.0).all(axis=1)]
    df = df[df.FTResult.isin(OUTCOMES)].copy()
    df["MatchDate"] = pd.to_datetime(df.MatchDate)
    # Football season: July to June. 2023-08-12 belongs to 2023/24 -> 2023.
    df["Season"] = df.MatchDate.dt.year - (df.MatchDate.dt.month < 7).astype(int)
    df["margin"] = mr.overround(df[ODDS].to_numpy())
    # Drop obviously broken quotes (negative or absurd margins).
    df = df[(df.margin > 0) & (df.margin < 0.25)]
    has_best = (df[BEST].notna().all(axis=1) & (df[BEST] > 1.0).all(axis=1)).to_numpy()
    best = np.full(len(df), np.nan)
    best[has_best] = mr.overround(df.loc[has_best, BEST].to_numpy())
    df["best_margin"] = best
    df["y"] = df.FTResult.map({"H": 0, "D": 1, "A": 2})
    return df.sort_values("MatchDate").reset_index(drop=True)


# ----------------------------------------------------------------------- helpers
def wilson(k: np.ndarray, n: np.ndarray, z: float = 1.96):
    p = k / n
    den = 1 + z ** 2 / n
    centre = (p + z ** 2 / (2 * n)) / den
    half = z * np.sqrt(p * (1 - p) / n + z ** 2 / (4 * n ** 2)) / den
    return centre - half, centre + half


def bootstrap_mean(x: np.ndarray, reps: int = 2000) -> tuple[float, float]:
    idx = RNG.integers(0, len(x), size=(reps, len(x)))
    means = x[idx].mean(axis=1)
    return float(np.percentile(means, 2.5)), float(np.percentile(means, 97.5))


def log_loss(p: np.ndarray, y: np.ndarray) -> float:
    return float(-np.mean(np.log(np.clip(p[np.arange(len(y)), y], 1e-12, 1))))


def brier(p: np.ndarray, y: np.ndarray) -> float:
    onehot = np.eye(3)[y]
    return float(np.mean(np.sum((p - onehot) ** 2, axis=1)))


def r(x: float, d: int = 4) -> float:
    return float(round(x, d))


# ------------------------------------------------------------------- analyses
def margins_by_season(df: pd.DataFrame) -> list[dict]:
    g = df.groupby("Season")
    out = []
    for season, s in g:
        if len(s) < 500:
            continue
        best = s.best_margin.dropna()
        out.append({
            "season": int(season),
            "n": int(len(s)),
            "margin": r(s.margin.median()),
            "bestMargin": r(best.median()) if len(best) > 200 else None,
            "arbShare": r((best < 0).mean()) if len(best) > 200 else None,
        })
    return out


def margins_by_league(df: pd.DataFrame, since: int = 2019) -> list[dict]:
    s = df[df.Season >= since]
    out = []
    for code, g in s.groupby("Division"):
        if len(g) < 1000:
            continue
        out.append({"code": code, "name": LEAGUE_NAMES.get(code, code), "n": int(len(g)), "margin": r(g.margin.median())})
    return sorted(out, key=lambda d: d["margin"])


def calibration(df: pd.DataFrame, probs: np.ndarray, bins: int = 20) -> list[dict]:
    p = probs.ravel()
    hit = (np.eye(3)[df.y.to_numpy()]).ravel()
    edges = np.linspace(0, 1, bins + 1)
    idx = np.clip(np.digitize(p, edges) - 1, 0, bins - 1)
    out = []
    for b in range(bins):
        m = idx == b
        n = int(m.sum())
        if n < 200:
            continue
        k = hit[m].sum()
        lo, hi = wilson(np.array([k]), np.array([n]))
        out.append({"predicted": r(p[m].mean()), "observed": r(k / n), "lo": r(lo[0]), "hi": r(hi[0]), "n": n})
    return out


def favourite_longshot(df: pd.DataFrame, cols: list[str], label: str) -> list[dict]:
    """Average return of a 1-unit bet on every outcome, grouped by its odds."""
    d = df.dropna(subset=cols)
    odds = d[cols].to_numpy().ravel()
    won = (np.eye(3)[d.y.to_numpy()]).ravel()
    ret = won * odds - 1.0
    edges = [1.0, 1.25, 1.5, 1.75, 2.0, 2.5, 3.0, 3.5, 4.0, 5.0, 6.5, 8.0, 10.0, 15.0, 25.0, 1000]
    out = []
    for lo, hi in zip(edges[:-1], edges[1:]):
        m = (odds >= lo) & (odds < hi)
        n = int(m.sum())
        if n < 500:
            continue
        clo, chi = bootstrap_mean(ret[m], reps=1000)
        out.append({
            "book": label, "from": lo, "to": hi if hi < 1000 else None, "n": n,
            "roi": r(ret[m].mean()), "lo": r(clo), "hi": r(chi),
            "meanOdds": r(odds[m].mean(), 2),
        })
    return out


def method_scores(df: pd.DataFrame, probs: dict[str, np.ndarray]) -> list[dict]:
    y = df.y.to_numpy()
    base = np.bincount(y, minlength=3) / len(y)
    rows = [{"method": "baseRates", "logLoss": r(log_loss(np.tile(base, (len(y), 1)), y)), "brier": r(brier(np.tile(base, (len(y), 1)), y))}]
    for name, p in probs.items():
        rows.append({"method": name, "logLoss": r(log_loss(p, y)), "brier": r(brier(p, y))})
    return rows


# ------------------------------------------------------------- Elo ordered logit
def fit_ordered_logit(x: np.ndarray, y: np.ndarray) -> np.ndarray:
    """P(y <= j) = sigmoid(c_j - b*x), y in {0: home, 1: draw, 2: away}.
    x is the Elo difference (home - away) in hundreds. Home advantage lives in
    the cut points."""
    def nll(theta):
        b, c0, dc = theta
        c1 = c0 + np.exp(dc)
        eta = b * x
        p0 = 1 / (1 + np.exp(-(c0 + eta)))
        p01 = 1 / (1 + np.exp(-(c1 + eta)))
        p = np.column_stack([p0, p01 - p0, 1 - p01])
        return -np.sum(np.log(np.clip(p[np.arange(len(y)), y], 1e-12, 1)))

    res = minimize(nll, x0=[0.5, 0.0, 0.0], method="Nelder-Mead", options={"maxiter": 4000, "xatol": 1e-6, "fatol": 1e-6})
    return res.x


def predict_ordered_logit(theta: np.ndarray, x: np.ndarray) -> np.ndarray:
    b, c0, dc = theta
    c1 = c0 + np.exp(dc)
    p0 = 1 / (1 + np.exp(-(c0 + b * x)))
    p01 = 1 / (1 + np.exp(-(c1 + b * x)))
    return np.column_stack([p0, p01 - p0, 1 - p01])


# ------------------------------------------------------------------ strategies
def cumulative(df: pd.DataFrame, pick: np.ndarray, odds_cols: list[str], name: str, key: str) -> dict:
    """pick: array of outcome index to back (or -1 for no bet). 1 unit per bet."""
    d = df.copy()
    d["pick"] = pick
    d = d[d.pick >= 0]
    odds = d[odds_cols].to_numpy()
    valid = ~np.isnan(odds[np.arange(len(d)), d.pick.to_numpy()])
    d = d[valid]
    o = d[odds_cols].to_numpy()[np.arange(len(d)), d.pick.to_numpy()]
    won = (d.pick.to_numpy() == d.y.to_numpy())
    pnl = np.where(won, o - 1.0, -1.0)
    cum = np.cumsum(pnl)
    # Sample ~120 points for the chart.
    step = max(1, len(cum) // 120)
    pts = [{"i": int(i + 1), "date": d.MatchDate.iloc[i].strftime("%Y-%m"), "pnl": r(cum[i], 1)} for i in range(0, len(cum), step)]
    pts.append({"i": int(len(cum)), "date": d.MatchDate.iloc[-1].strftime("%Y-%m"), "pnl": r(cum[-1], 1)})
    lo, hi = bootstrap_mean(pnl, reps=500)
    return {"key": key, "name": name, "bets": int(len(pnl)), "winRate": r(won.mean()), "roi": r(pnl.mean()), "roiLo": r(lo), "roiHi": r(hi), "series": pts}


def strategies(df: pd.DataFrame, test_from: int) -> tuple[list[dict], dict]:
    t = df[df.Season >= test_from].reset_index(drop=True)
    odds = t[ODDS].to_numpy()
    fav = odds.argmin(axis=1)
    dog = odds.argmax(axis=1)
    rand = RNG.integers(0, 3, size=len(t))
    out = [
        cumulative(t, np.zeros(len(t), int), ODDS, "Always the home team", "home"),
        cumulative(t, np.ones(len(t), int), ODDS, "Always the draw", "draw"),
        cumulative(t, np.full(len(t), 2), ODDS, "Always the away team", "away"),
        cumulative(t, fav, ODDS, "Always the favourite", "favourite"),
        cumulative(t, dog, ODDS, "Always the underdog", "underdog"),
        cumulative(t, rand, ODDS, "Pick at random", "random"),
        cumulative(t, fav, BEST, "Favourite, best price of ~17 books", "favouriteBest"),
    ]

    # Elo "tipster": fit on older seasons, bet when the model sees value.
    train = df[(df.Season < test_from)].dropna(subset=["HomeElo", "AwayElo"])
    theta = fit_ordered_logit(((train.HomeElo - train.AwayElo) / 100).to_numpy(), train.y.to_numpy())
    tt = t.dropna(subset=["HomeElo", "AwayElo"]).reset_index(drop=True)
    p_model = predict_ordered_logit(theta, ((tt.HomeElo - tt.AwayElo) / 100).to_numpy())
    ev = p_model * tt[ODDS].to_numpy() - 1.0
    best_ev = ev.max(axis=1)
    pick = np.where(best_ev > 0.05, ev.argmax(axis=1), -1)
    out.append(cumulative(tt, pick, ODDS, "Elo model 'value bets' (EV > 5%)", "eloValue"))

    p_market = mr.shin(tt[ODDS].to_numpy())[0]
    model_eval = {
        "trainSeasons": [int(train.Season.min()), int(test_from - 1)],
        "testSeasons": [int(test_from), int(t.Season.max())],
        "nTest": int(len(tt)),
        "coef": {"b": r(theta[0]), "c0": r(theta[1]), "c1": r(theta[1] + np.exp(theta[2]))},
        "logLossElo": r(log_loss(p_model, tt.y.to_numpy())),
        "logLossMarket": r(log_loss(p_market, tt.y.to_numpy())),
        "brierElo": r(brier(p_model, tt.y.to_numpy())),
        "brierMarket": r(brier(p_market, tt.y.to_numpy())),
    }
    return out, model_eval


# ------------------------------------------------------------------------ main
def main(path: str) -> None:
    OUT.mkdir(parents=True, exist_ok=True)
    df = load(path)
    print(f"{len(df):,} matches after cleaning")

    recent = df[df.Season >= 2012].reset_index(drop=True)
    odds = recent[ODDS].to_numpy()
    p_prop = mr.proportional(odds)
    p_pow = mr.power(odds)
    p_shin, z = mr.shin(odds)
    print("margin removal done")

    summary = {
        "matches": int(len(df)),
        "leagues": int(df.Division.nunique()),
        "firstDate": df.MatchDate.min().strftime("%Y-%m-%d"),
        "lastDate": df.MatchDate.max().strftime("%Y-%m-%d"),
        "medianMargin": r(df.margin.median()),
        "medianBestMargin": r(df.best_margin.dropna().median()),
        "shinZMedian": r(float(np.median(z))),
        "outcomeShares": {k: r(v) for k, v in df.FTResult.value_counts(normalize=True).items()},
    }

    files = {
        "summary.json": summary,
        "margins-by-season.json": margins_by_season(df),
        "margins-by-league.json": margins_by_league(df),
        "calibration.json": calibration(recent, p_prop),
        "favourite-longshot.json": favourite_longshot(recent, ODDS, "reference") + favourite_longshot(recent, BEST, "best"),
        "methods.json": method_scores(recent, {"proportional": p_prop, "power": p_pow, "shin": p_shin}),
    }
    strat, model_eval = strategies(df, test_from=2016)
    files["strategies.json"] = strat
    files["elo-vs-market.json"] = model_eval

    for name, data in files.items():
        (OUT / name).write_text(json.dumps(data, ensure_ascii=False, separators=(",", ":")))
        print("wrote", name)


if __name__ == "__main__":
    main(sys.argv[1] if len(sys.argv) > 1 else str(ROOT.parent / "data" / "Matches.csv"))
