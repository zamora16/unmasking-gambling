/** Odds formats, accumulators and losing streaks. */
export const decimalToImplied = (d: number) => 1 / d;
export const decimalToAmerican = (d: number) => (d >= 2 ? Math.round((d - 1) * 100) : Math.round(-100 / (d - 1)));
export const americanToDecimal = (a: number) => (a > 0 ? 1 + a / 100 : 1 + 100 / -a);

/** Decimal odds as the nearest simple fraction (e.g. 2.5 → "3/2"). */
export function decimalToFractional(d: number, maxDen = 20): string {
  const x = d - 1;
  let best = { n: Math.round(x), den: 1, err: Math.abs(x - Math.round(x)) };
  for (let den = 2; den <= maxDen; den++) {
    const n = Math.round(x * den);
    const err = Math.abs(x - n / den);
    if (err < best.err - 1e-9) best = { n, den, err };
  }
  const g = gcd(best.n, best.den);
  return `${best.n / g}/${best.den / g}`;
}
const gcd = (a: number, b: number): number => (b ? gcd(b, a % b) : Math.abs(a) || 1);

/** An accumulator: odds multiply; so does the margin. `margin` is the
 *  bookmaker overround applied to each leg (proportional split). */
export function accumulator(legs: number[], margin: number) {
  const odds = legs.reduce((a, b) => a * b, 1);
  const pTrue = legs.reduce((a, o) => a * (1 / o / (1 + margin)), 1);
  const expectedReturn = pTrue * odds; // per unit staked
  return { odds, pTrue, expectedReturn, effectiveEdge: 1 - expectedReturn };
}

/** Longest run of consecutive losses in n bets, simulated `seasons` times. */
export function longestLosingStreaks(n: number, pWin: number, seasons: number, rand: () => number): number[] {
  const out = new Array<number>(seasons);
  for (let s = 0; s < seasons; s++) {
    let run = 0;
    let best = 0;
    for (let i = 0; i < n; i++) {
      if (rand() < pWin) run = 0;
      else if (++run > best) best = run;
    }
    out[s] = best;
  }
  return out;
}
