"""Pre-match features built only from each team's earlier matches.

Every rolling statistic is shifted by one match, so the row for a match never
sees that match's own result. tests: analysis/odds/test_features.py
"""
from __future__ import annotations

import numpy as np
import pandas as pd

STATS = ["pts", "gf", "ga", "draw", "sf", "sa", "tf", "ta"]


def team_long(raw: pd.DataFrame) -> pd.DataFrame:
    """One row per team per match, from the match table (needs a `rid` id)."""
    played = raw.dropna(subset=["FTHome", "FTAway"])
    date = pd.to_datetime(played.MatchDate)
    sides = []
    for home, us, them in ((1, "Home", "Away"), (0, "Away", "Home")):
        sides.append(pd.DataFrame({
            "rid": played.rid.to_numpy(),
            "date": date.to_numpy(),
            "team": played[f"{us}Team"].to_numpy(),
            "home": home,
            "gf": played[f"FT{us}"].to_numpy(),
            "ga": played[f"FT{them}"].to_numpy(),
            "sf": played[f"{us}Shots"].to_numpy(),
            "sa": played[f"{them}Shots"].to_numpy(),
            "tf": played[f"{us}Target"].to_numpy(),
            "ta": played[f"{them}Target"].to_numpy(),
            "elo": played[f"{us}Elo"].to_numpy(),
        }))
    long = pd.concat(sides, ignore_index=True)
    long["pts"] = np.where(long.gf > long.ga, 3, np.where(long.gf == long.ga, 1, 0))
    long["draw"] = (long.gf == long.ga).astype(float)
    return long.sort_values(["team", "date", "rid"]).reset_index(drop=True)


def _rolling(prev: pd.DataFrame, keys: pd.Series | list, w: int) -> pd.DataFrame:
    out = prev.groupby(keys, sort=False).rolling(w, min_periods=1).mean()
    return out.reset_index(level=list(range(out.index.nlevels - 1)), drop=True).sort_index()


def team_features(long: pd.DataFrame) -> pd.DataFrame:
    g = long.groupby("team", sort=False)
    prev = g[STATS].shift()
    f = pd.DataFrame(index=long.index)
    f["rid"] = long.rid
    f["home"] = long.home
    for w in (5, 20):
        roll = _rolling(prev, long.team, w)
        for c in ["pts", "gf", "ga"]:
            f[f"{c}{w}"] = roll[c]
    roll20 = _rolling(prev, long.team, 20)
    f["draw20"] = roll20.draw
    roll10 = _rolling(prev, long.team, 10)
    for c in ["sf", "sa", "tf", "ta"]:
        f[f"{c}10"] = roll10[c]

    # form at the same venue: home team at home, away team away
    gv = long.groupby(["team", "home"], sort=False)
    prev_v = gv[["pts", "gf", "ga"]].shift()
    roll_v = _rolling(prev_v, [long.team, long.home], 10)
    f["venue_pts10"] = roll_v.pts
    f["venue_gd10"] = roll_v.gf - roll_v.ga

    f["rest"] = (long.date - g.date.shift()).dt.days.clip(upper=60)
    f["elo_trend5"] = long.elo - g.elo.shift(5)
    f["n_prev"] = np.log1p(g.cumcount())
    return f


def match_features(raw: pd.DataFrame) -> pd.DataFrame:
    """One row per match id (`rid`), with h_* and a_* team features and diffs."""
    f = team_features(team_long(raw))
    cols = [c for c in f.columns if c not in ("rid", "home")]
    h = f[f.home == 1].set_index("rid")[cols].add_prefix("h_")
    a = f[f.home == 0].set_index("rid")[cols].add_prefix("a_")
    m = h.join(a, how="outer").sort_index()
    for c in ["pts5", "pts20", "gf20", "ga20", "venue_gd10"]:
        m[f"d_{c}"] = m[f"h_{c}"] - m[f"a_{c}"]
    return m
