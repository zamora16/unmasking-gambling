/** A game is a discrete distribution over what one unit staked pays back
 *  (the gross return, stake included). 0 = you lose the stake. */
export interface Outcome {
  p: number;
  payout: number;
}

export interface Game {
  id: GameId;
  outcomes: Outcome[];
}

export type GameId =
  | 'rouletteRed'
  | 'rouletteNumber'
  | 'rouletteAmerican'
  | 'slotLow'
  | 'slotHigh'
  | 'sportsBet'
  | 'fairCoin';

export function expectedReturn(g: Game): number {
  return g.outcomes.reduce((s, o) => s + o.p * o.payout, 0);
}

/** House edge = what the house keeps per unit staked, on average. */
export function houseEdge(g: Game): number {
  return 1 - expectedReturn(g);
}

export function variance(g: Game): number {
  const m = expectedReturn(g);
  return g.outcomes.reduce((s, o) => s + o.p * (o.payout - m) ** 2, 0);
}

/** Slot machine with a target RTP. The shape of the paytable sets the
 *  volatility; we then scale the winning probabilities so the expected
 *  return equals the RTP exactly. */
export function slot(rtp: number, volatility: 'low' | 'high'): Outcome[] {
  const table =
    volatility === 'low'
      ? [
          { payout: 0.5, w: 0.18 },
          { payout: 1, w: 0.12 },
          { payout: 2, w: 0.1 },
          { payout: 5, w: 0.025 },
          { payout: 20, w: 0.002 },
        ]
      : [
          { payout: 1, w: 0.1 },
          { payout: 3, w: 0.04 },
          { payout: 10, w: 0.012 },
          { payout: 50, w: 0.0015 },
          { payout: 500, w: 0.00012 },
          { payout: 5000, w: 0.000006 },
        ];
  const raw = table.reduce((s, r) => s + r.w * r.payout, 0);
  const k = rtp / raw;
  const wins = table.map((r) => ({ p: r.w * k, payout: r.payout }));
  const pWin = wins.reduce((s, o) => s + o.p, 0);
  if (pWin >= 1) throw new Error('RTP too high for this paytable');
  return [{ p: 1 - pWin, payout: 0 }, ...wins];
}

/** A bet at decimal odds `odds` on an outcome whose true probability is
 *  1/odds shaded by the bookmaker margin (proportional split). */
export function sportsBet(odds: number, margin: number): Outcome[] {
  const p = 1 / odds / (1 + margin);
  return [
    { p: 1 - p, payout: 0 },
    { p, payout: odds },
  ];
}

export const GAMES: Record<GameId, Game> = {
  rouletteRed: { id: 'rouletteRed', outcomes: [{ p: 19 / 37, payout: 0 }, { p: 18 / 37, payout: 2 }] },
  rouletteNumber: { id: 'rouletteNumber', outcomes: [{ p: 36 / 37, payout: 0 }, { p: 1 / 37, payout: 36 }] },
  rouletteAmerican: { id: 'rouletteAmerican', outcomes: [{ p: 20 / 38, payout: 0 }, { p: 18 / 38, payout: 2 }] },
  slotLow: { id: 'slotLow', outcomes: slot(0.96, 'low') },
  slotHigh: { id: 'slotHigh', outcomes: slot(0.96, 'high') },
  sportsBet: { id: 'sportsBet', outcomes: sportsBet(2.0, 0.065) },
  fairCoin: { id: 'fairCoin', outcomes: [{ p: 0.5, payout: 0 }, { p: 0.5, payout: 2 }] },
};

/** Draw one payout using inverse-CDF sampling on a precomputed table. */
export function sampler(g: Game): (u: number) => number {
  const cum: number[] = [];
  let acc = 0;
  for (const o of g.outcomes) {
    acc += o.p;
    cum.push(acc);
  }
  const pay = g.outcomes.map((o) => o.payout);
  const n = cum.length;
  return (u: number) => {
    for (let i = 0; i < n; i++) if (u < cum[i]) return pay[i];
    return pay[n - 1];
  };
}
