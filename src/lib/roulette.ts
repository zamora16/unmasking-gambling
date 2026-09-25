/** European roulette: wheel layout, bets and their exact expectation. */
export const WHEEL = [0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26];
export const REDS = new Set([1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]);

export type Colour = 'red' | 'black' | 'green';
export const colour = (n: number): Colour => (n === 0 ? 'green' : REDS.has(n) ? 'red' : 'black');

export type BetKind = 'red' | 'black' | 'even' | 'odd' | 'low' | 'high' | 'dozen1' | 'dozen2' | 'dozen3' | 'number';

export interface Bet {
  kind: BetKind;
  number?: number;
}

/** Numbers covered by a bet. */
export function covers(b: Bet): number[] {
  const all = Array.from({ length: 36 }, (_, i) => i + 1);
  switch (b.kind) {
    case 'red':
      return all.filter((n) => REDS.has(n));
    case 'black':
      return all.filter((n) => !REDS.has(n));
    case 'even':
      return all.filter((n) => n % 2 === 0);
    case 'odd':
      return all.filter((n) => n % 2 === 1);
    case 'low':
      return all.filter((n) => n <= 18);
    case 'high':
      return all.filter((n) => n >= 19);
    case 'dozen1':
      return all.filter((n) => n <= 12);
    case 'dozen2':
      return all.filter((n) => n >= 13 && n <= 24);
    case 'dozen3':
      return all.filter((n) => n >= 25);
    case 'number':
      return [b.number ?? 0];
  }
}

/** Casino payout "x to 1": 36/k − 1 for a bet covering k numbers. */
export const payoutToOne = (b: Bet) => 36 / covers(b).length - 1;

/** Net result of a 1-unit bet when `n` comes up. */
export function settle(b: Bet, n: number): number {
  return covers(b).includes(n) ? payoutToOne(b) : -1;
}

/** Exact expected value of a 1-unit bet. */
export function expectation(b: Bet): number {
  const k = covers(b).length;
  return (k / 37) * payoutToOne(b) - (37 - k) / 37;
}
