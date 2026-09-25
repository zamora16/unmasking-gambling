/** A three-reel slot machine built like real ones: a short "physical" strip of
 *  symbols that the player sees, and a larger "virtual" reel of weighted stops
 *  that decides the outcome. Weighting the blanks next to the jackpot symbol
 *  makes it appear just above or below the payline far more often than it
 *  lands on it: the near-miss. */
export type Sym = '7' | 'BAR' | '♦' | '♥' | '♣' | '♠' | '';

export const STRIP: Sym[] = ['7', '', '♠', '', '♣', '', '♥', '', '♦', '', 'BAR', '', '♠', ''];

/** Virtual weight of each physical stop (64 per reel). */
export const WEIGHTS: number[][] = [
  [2, 3, 7, 3, 10, 3, 8, 3, 6, 3, 4, 3, 7, 2],
  [2, 3, 7, 3, 10, 3, 8, 3, 6, 3, 4, 3, 7, 2],
  // reel 3: one stop for the 7, but its two neighbouring blanks weigh 8 each
  [1, 8, 8, 1, 10, 1, 8, 1, 6, 1, 4, 1, 7, 7],
];

export const PAYTABLE = {
  three: { '7': 5000, BAR: 250, '♦': 60, '♥': 30, '♣': 15, '♠': 8 } as Record<string, number>,
  anySuits: 2, // three suit symbols, mixed
  twoSpades: 3, // ♠ ♠ on reels 1 and 2
  oneSpade: 1, // ♠ on reel 1
};

const SUITS = new Set(['♦', '♥', '♣', '♠']);

/** Gross payout (stake included) for a line of three symbols. */
export function payout(line: Sym[]): number {
  const [a, b, c] = line;
  if (a === b && b === c && PAYTABLE.three[a]) return PAYTABLE.three[a];
  if (SUITS.has(a) && SUITS.has(b) && SUITS.has(c)) return PAYTABLE.anySuits;
  if (a === '♠' && b === '♠') return PAYTABLE.twoSpades;
  if (a === '♠') return PAYTABLE.oneSpade;
  return 0;
}

const total = (w: number[]) => w.reduce((s, x) => s + x, 0);

/** Exact return-to-player by enumerating every combination of stops. */
export function exactRTP(weights = WEIGHTS): { rtp: number; hitRate: number } {
  const T = weights.map(total);
  let rtp = 0;
  let hit = 0;
  for (let i = 0; i < STRIP.length; i++)
    for (let j = 0; j < STRIP.length; j++)
      for (let k = 0; k < STRIP.length; k++) {
        const p = (weights[0][i] / T[0]) * (weights[1][j] / T[1]) * (weights[2][k] / T[2]);
        const w = payout([STRIP[i], STRIP[j], STRIP[k]]);
        rtp += p * w;
        if (w > 0) hit += p;
      }
  return { rtp, hitRate: hit };
}

/** Pick a stop on one reel using its virtual weights. */
export function spinReel(reel: number, u: number, weights = WEIGHTS): number {
  const w = weights[reel];
  let x = u * total(w);
  for (let i = 0; i < w.length; i++) {
    x -= w[i];
    if (x < 0) return i;
  }
  return w.length - 1;
}

/** Symbols visible on a reel: above, payline, below. */
export function window3(stop: number): [Sym, Sym, Sym] {
  const n = STRIP.length;
  return [STRIP[(stop - 1 + n) % n], STRIP[stop], STRIP[(stop + 1) % n]];
}

/** A 7 visible right next to the payline on any reel, without a win. */
export function isNearMiss(stops: number[]): boolean {
  const line = stops.map((s) => STRIP[s]);
  if (payout(line) > 0) return false;
  return stops.some((s) => {
    const [up, , down] = window3(s);
    return up === '7' || down === '7';
  });
}

/** Probability that a 7 is visible just off the payline on reel r (vs. on it). */
export function sevenOdds(reel: number, weights = WEIGHTS) {
  const w = weights[reel];
  const T = total(w);
  const n = STRIP.length;
  const on = STRIP.reduce((s, sym, i) => s + (sym === '7' ? w[i] : 0), 0) / T;
  const adjacent = STRIP.reduce((s, _, i) => s + (STRIP[(i - 1 + n) % n] === '7' || STRIP[(i + 1) % n] === '7' ? w[i] : 0), 0) / T;
  return { on, adjacent };
}
