/** Turning decimal odds into probabilities (browser version of
 *  analysis/odds/margin_removal.py). */

export const implied = (odds: number[]) => odds.map((o) => 1 / o);
export const overround = (odds: number[]) => implied(odds).reduce((a, b) => a + b, 0) - 1;

function bisect(f: (x: number) => number, lo: number, hi: number, tol = 1e-12): number {
  let flo = f(lo);
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const fm = f(mid);
    if (Math.abs(fm) < tol) return mid;
    if (Math.sign(fm) === Math.sign(flo)) {
      lo = mid;
      flo = fm;
    } else hi = mid;
  }
  return (lo + hi) / 2;
}

export function proportional(odds: number[]): number[] {
  const pi = implied(odds);
  const s = pi.reduce((a, b) => a + b, 0);
  return pi.map((p) => p / s);
}

export function power(odds: number[]): number[] {
  const pi = implied(odds);
  const k = bisect((k) => pi.reduce((s, p) => s + p ** k, 0) - 1, 0.2, 5);
  return pi.map((p) => p ** k);
}

export function shin(odds: number[]): { probs: number[]; z: number } {
  const pi = implied(odds);
  const s = pi.reduce((a, b) => a + b, 0);
  const probs = (z: number) => pi.map((p) => (Math.sqrt(z * z + (4 * (1 - z) * p * p) / s) - z) / (2 * (1 - z)));
  const z = s > 1 ? bisect((z) => probs(z).reduce((a, b) => a + b, 0) - 1, 0, 0.5) : 0;
  return { probs: probs(z), z };
}
