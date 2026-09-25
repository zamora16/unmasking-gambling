"""Methods to turn bookmaker odds into probabilities.

Decimal odds o_i imply "probabilities" pi_i = 1 / o_i that add up to more
than 1. The excess (the overround) is the bookmaker's margin. Each method
below removes it differently; they disagree most on long shots.
"""
from __future__ import annotations

import numpy as np
from scipy.optimize import brentq


def implied(odds: np.ndarray) -> np.ndarray:
    """Raw implied probabilities 1/odds. Shape (n, k)."""
    return 1.0 / odds


def overround(odds: np.ndarray) -> np.ndarray:
    """Sum of implied probabilities minus one, per row."""
    return implied(odds).sum(axis=1) - 1.0


def proportional(odds: np.ndarray) -> np.ndarray:
    """Normalise 1/odds so each row sums to one (the 'basic' method)."""
    pi = implied(odds)
    return pi / pi.sum(axis=1, keepdims=True)


def _power_row(pi: np.ndarray) -> np.ndarray:
    # Find k such that sum(pi ** k) == 1. k > 1 when there is a positive margin,
    # which shrinks small probabilities more than large ones.
    f = lambda k: np.sum(pi ** k) - 1.0
    k = brentq(f, 0.5, 5.0)
    return pi ** k


def power(odds: np.ndarray) -> np.ndarray:
    """Power method: p_i = pi_i ** k with k chosen so the row sums to one."""
    pi = implied(odds)
    return np.vstack([_power_row(row) for row in pi])


def _shin_row(pi: np.ndarray) -> tuple[np.ndarray, float]:
    """Shin (1993) model: part of the money comes from insiders, so the
    bookmaker protects itself by shortening long shots the most.
    Returns the probabilities and z, the estimated share of insider money."""
    s = pi.sum()

    def probs(z: float) -> np.ndarray:
        return (np.sqrt(z ** 2 + 4 * (1 - z) * pi ** 2 / s) - z) / (2 * (1 - z))

    z = brentq(lambda z: probs(z).sum() - 1.0, 0.0, 0.4)
    return probs(z), z


def shin(odds: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Shin's method. Returns (probabilities, z per row)."""
    out = [_shin_row(row) for row in implied(odds)]
    return np.vstack([p for p, _ in out]), np.array([z for _, z in out])
