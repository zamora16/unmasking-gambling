/** Exact binomial tail probabilities, in log space so n can reach 10^5. */

// Lanczos approximation (g = 7, n = 9), accurate to ~15 digits
const LANCZOS = [0.99999999999980993, 676.5203681218851, -1259.1392167224028, 771.32342877765313, -176.61502916214059, 12.507343278686905, -0.13857109526572012, 9.9843695780195716e-6, 1.5056327351493116e-7];

export function logGamma(x: number): number {
  if (x < 0.5) return Math.log(Math.PI / Math.sin(Math.PI * x)) - logGamma(1 - x);
  x -= 1;
  let a = LANCZOS[0];
  const t = x + 7.5;
  for (let i = 1; i < 9; i++) a += LANCZOS[i] / (x + i);
  return 0.5 * Math.log(2 * Math.PI) + (x + 0.5) * Math.log(t) - t + Math.log(a);
}

export function logChoose(n: number, k: number): number {
  return logGamma(n + 1) - logGamma(k + 1) - logGamma(n - k + 1);
}

export function binomPmf(k: number, n: number, p: number): number {
  if (k < 0 || k > n) return 0;
  if (p === 0) return k === 0 ? 1 : 0;
  if (p === 1) return k === n ? 1 : 0;
  return Math.exp(logChoose(n, k) + k * Math.log(p) + (n - k) * Math.log(1 - p));
}

/**
 * After n bets of one unit on a bet that pays `toOne`:1 with chance p, the
 * chance of being ahead, exactly even, or behind. Net result with w wins is
 * w·(toOne + 1) − n.
 */
export function aheadEvenBehind(n: number, p: number, toOne: number): { ahead: number; even: number; behind: number } {
  const k = toOne + 1;
  let ahead = 0;
  let even = 0;
  for (let w = Math.ceil(n / k); w <= n; w++) {
    const net = w * k - n;
    const pr = binomPmf(w, n, p);
    if (net === 0) even += pr;
    else ahead += pr;
    // far in the upper tail the terms vanish
    if (w > n * p && pr < 1e-18) break;
  }
  return { ahead, even, behind: Math.max(0, 1 - ahead - even) };
}
