/** Exact probabilities for Spanish and European lotteries. */
export function choose(n: number, k: number): number {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return Math.round(r);
}

export interface Category {
  key: string;
  p: number;
}

/** 6/49 games (La Primitiva, Bonoloto): k matches out of 6, with the bonus ball
 *  ("complementario") for the 5+1 category. Reintegro is a separate 1/10 draw. */
export function sixFortyNine(): Category[] {
  const N = choose(49, 6);
  const exact = (k: number) => (choose(6, k) * choose(43, 6 - k)) / N;
  // 5 + complementario: 5 of the 6, and the remaining pick equals the bonus ball
  const p5 = exact(5);
  const p5c = p5 * (1 / 43);
  return [
    { key: '6', p: exact(6) },
    { key: '5+C', p: p5c },
    { key: '5', p: p5 - p5c },
    { key: '4', p: exact(4) },
    { key: '3', p: exact(3) },
  ];
}

/** EuroMillions: 5 of 50 numbers and 2 of 12 stars. */
export function euromillions(): Category[] {
  const pn = (k: number) => (choose(5, k) * choose(45, 5 - k)) / choose(50, 5);
  const ps = (j: number) => (choose(2, j) * choose(10, 2 - j)) / choose(12, 2);
  const cats: [number, number][] = [
    [5, 2], [5, 1], [5, 0], [4, 2], [4, 1], [3, 2], [4, 0], [2, 2], [3, 1], [3, 0], [1, 2], [2, 1], [2, 0],
  ];
  return cats.map(([k, j]) => ({ key: `${k}+${j}`, p: pn(k) * ps(j) }));
}

export type LotteryId = 'primitiva' | 'bonoloto' | 'euromillones' | 'nacional';

export const LOTTERIES: Record<LotteryId, { price: number; payout: number; drawsPerWeek: number; jackpot: () => number; categories: () => Category[] }> = {
  primitiva: { price: 1, payout: 0.55, drawsPerWeek: 3, jackpot: () => 1 / choose(49, 6), categories: sixFortyNine },
  bonoloto: { price: 0.5, payout: 0.55, drawsPerWeek: 6, jackpot: () => 1 / choose(49, 6), categories: sixFortyNine },
  euromillones: { price: 2.5, payout: 0.5, drawsPerWeek: 2, jackpot: () => euromillions()[0].p, categories: euromillions },
  nacional: { price: 3, payout: 0.7, drawsPerWeek: 2, jackpot: () => 1 / 100000, categories: () => [{ key: '1º', p: 1 / 100000 }] },
};

/** Draw k distinct numbers from 1..n with a uniform generator. */
export function drawNumbers(n: number, k: number, rand: () => number): number[] {
  const pool = Array.from({ length: n }, (_, i) => i + 1);
  for (let i = 0; i < k; i++) {
    const j = i + Math.floor(rand() * (n - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, k);
}
