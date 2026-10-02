"""Run: python -m unittest analysis/odds/test_features.py"""
import sys
import unittest
from pathlib import Path

import numpy as np
import pandas as pd

sys.path.insert(0, str(Path(__file__).parent))
from features import match_features  # noqa: E402


def fixtures(seed: int = 0, n: int = 60) -> pd.DataFrame:
    rng = np.random.default_rng(seed)
    teams = list("ABCDEF")
    rows = []
    for i in range(n):
        h, a = rng.choice(teams, 2, replace=False)
        rows.append({
            "rid": i, "MatchDate": pd.Timestamp("2020-01-01") + pd.Timedelta(days=3 * i),
            "HomeTeam": h, "AwayTeam": a, "FTHome": rng.integers(0, 4), "FTAway": rng.integers(0, 4),
            "HomeShots": rng.integers(5, 20), "AwayShots": rng.integers(5, 20),
            "HomeTarget": rng.integers(0, 8), "AwayTarget": rng.integers(0, 8),
            "HomeElo": 1500 + rng.normal(0, 50), "AwayElo": 1500 + rng.normal(0, 50),
        })
    return pd.DataFrame(rows)


class NoLeakage(unittest.TestCase):
    def test_changing_a_result_only_moves_later_matches(self):
        raw = fixtures()
        base = match_features(raw)
        k = 30
        changed = raw.copy()
        changed.loc[k, ["FTHome", "FTAway", "HomeShots", "HomeTarget"]] = [9, 0, 40, 30]
        after = match_features(changed)
        pd.testing.assert_frame_equal(base.loc[: k], after.loc[: k])
        self.assertFalse(base.loc[k + 1 :].equals(after.loc[k + 1 :]))

    def test_first_match_of_a_team_has_no_form(self):
        raw = fixtures()
        f = match_features(raw)
        self.assertTrue(np.isnan(f.loc[0, "h_pts5"]))
        self.assertTrue(np.isnan(f.loc[0, "a_pts5"]))

    def test_points_average_matches_hand_count(self):
        raw = pd.DataFrame([
            {"rid": i, "MatchDate": f"2020-01-0{i + 1}", "HomeTeam": "A", "AwayTeam": "B", "FTHome": gh, "FTAway": ga,
             "HomeShots": np.nan, "AwayShots": np.nan, "HomeTarget": np.nan, "AwayTarget": np.nan,
             "HomeElo": 1500.0, "AwayElo": 1500.0}
            for i, (gh, ga) in enumerate([(2, 0), (1, 1), (0, 3), (1, 0)])
        ])
        f = match_features(raw)
        # before match 3, A has W, D, L -> 4 points in 3 games
        self.assertAlmostEqual(f.loc[3, "h_pts5"], 4 / 3)
        self.assertAlmostEqual(f.loc[3, "a_pts5"], 4 / 3)
        self.assertAlmostEqual(f.loc[3, "h_draw20"], 1 / 3)


if __name__ == "__main__":
    unittest.main()
