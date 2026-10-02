"""
Distribution of what one décimo of the Spanish Christmas Lottery pays.

A number can collect several prizes at once (a pedrea number in the same
hundred as the Gordo, a ticket that shares the hundred of the third prize and
the last digit of the first...), so the per-décimo distribution is not the
prize table itself. We simulate full draws and evaluate all 100,000 numbers in
each one, with the prize programme of the 2025 draw (SELAE). Each series pays
14,000,000 EUR out of 20,000,000 EUR sold: 70%.

    python analysis/navidad/prizes.py [draws]   ->  src/data/navidad.json
"""
import json
import sys
from pathlib import Path

import numpy as np

N = 100_000
PRICE = 20  # one décimo
PER_DECIMO = 0.1  # prizes below are per series (billete of 10 décimos)

# (name, count, prize per series)
MAIN = [("first", 1, 4_000_000), ("second", 1, 1_250_000), ("third", 1, 500_000),
        ("fourth", 2, 200_000), ("fifth", 8, 60_000), ("pedrea", 1_794, 1_000)]
APPROX = {"first": 20_000, "second": 12_500, "third": 9_600}  # number before and after
HUNDRED = 1_000   # rest of the hundred of the 1st, 2nd, 3rd and both 4th prizes
LAST_TWO = 1_000  # last two digits of the 1st, 2nd and 3rd prizes
REFUND = 200      # last digit of the 1st prize

TAX_FREE = 40_000
TAX = 0.20


def programme_total() -> int:
    main = sum(c * p for _, c, p in MAIN)
    approx = 2 * sum(APPROX.values())
    hundreds = 99 * 5 * HUNDRED
    last_two = 999 * 3 * LAST_TWO
    refunds = 9_999 * REFUND
    return main + approx + hundreds + last_two + refunds


def one_draw(rng: np.random.Generator, numbers: np.ndarray) -> np.ndarray:
    """Prize per series for every number 00000-99999 in one random draw."""
    drawn = rng.choice(N, size=sum(c for _, c, _ in MAIN), replace=False)
    pay = np.zeros(N, dtype=np.int64)
    i = 0
    winners = {}
    for name, count, prize in MAIN:
        w = drawn[i:i + count]
        pay[w] += prize
        winners[name] = w
        i += count
    for name, prize in APPROX.items():
        w = winners[name][0]
        pay[(w - 1) % N] += prize
        pay[(w + 1) % N] += prize
    for w in np.concatenate([winners["first"], winners["second"], winners["third"], winners["fourth"]]):
        same = (numbers // 100) == (w // 100)
        same[w] = False
        pay[same] += HUNDRED
    for name in ("first", "second", "third"):
        w = winners[name][0]
        same = (numbers % 100) == (w % 100)
        same[w] = False
        pay[same] += LAST_TWO
    w = winners["first"][0]
    same = (numbers % 10) == (w % 10)
    same[w] = False
    pay[same] += REFUND
    return pay


def net(gross: float) -> float:
    return gross - TAX * max(0.0, gross - TAX_FREE)


def main(draws: int) -> None:
    assert programme_total() == 14_000_000, programme_total()
    rng = np.random.default_rng(2025)
    numbers = np.arange(N)
    counts: dict[int, int] = {}
    for _ in range(draws):
        values, c = np.unique(one_draw(rng, numbers), return_counts=True)
        for v, k in zip(values.tolist(), c.tolist()):
            counts[v] = counts.get(v, 0) + k
    total = draws * N
    # per-décimo amounts
    dist = sorted(((v * PER_DECIMO, k / total) for v, k in counts.items()), key=lambda x: x[0])
    ev = sum(v * p for v, p in dist)
    ev_net = sum(net(v) * p for v, p in dist)
    p_any = sum(p for v, p in dist if v > 0)
    p_profit = sum(p for v, p in dist if v > PRICE)
    out = {
        "source": "Programa de premios del Sorteo Extraordinario de Navidad 2025 (SELAE). Simulación de sorteos completos.",
        "draws": draws,
        "price": PRICE,
        "payoutShare": 0.7,
        "taxFree": TAX_FREE,
        "taxRate": TAX,
        "ev": round(ev, 4),
        "evNet": round(ev_net, 4),
        "pAny": round(p_any, 6),
        "pProfit": round(p_profit, 6),
        # exact by construction: every number is equally likely to be each main prize
        "pFirst": 1 / N,
        "dist": [{"v": round(v, 2), "p": p} for v, p in dist],
    }
    path = Path(__file__).resolve().parents[2] / "src" / "data" / "navidad.json"
    path.write_text(json.dumps(out, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"{draws} draws  EV {ev:.3f}  EV net {ev_net:.3f}  P(any) {p_any:.4f}  P(> price) {p_profit:.4f}  -> {path}")


if __name__ == "__main__":
    main(int(sys.argv[1]) if len(sys.argv) > 1 else 4000)
