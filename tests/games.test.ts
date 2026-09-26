import { describe, expect, it } from 'vitest';
import { GAMES, expectedReturn, houseEdge, slot, sportsBet, sampler } from '../src/lib/games';
import { mulberry32 } from '../src/lib/rng';

describe('games', () => {
  it('European roulette has a 1/37 house edge on every bet', () => {
    expect(houseEdge(GAMES.rouletteRed)).toBeCloseTo(1 / 37, 12);
    expect(houseEdge(GAMES.rouletteNumber)).toBeCloseTo(1 / 37, 12);
  });
  it('American roulette has a 2/38 house edge', () => {
    expect(houseEdge(GAMES.rouletteAmerican)).toBeCloseTo(2 / 38, 12);
  });
  it('slot paytables hit their target RTP exactly', () => {
    for (const vol of ['low', 'high'] as const) {
      for (const rtp of [0.9, 0.94, 0.97]) {
        const g = { id: 'slotLow' as const, outcomes: slot(rtp, vol) };
        expect(expectedReturn(g)).toBeCloseTo(rtp, 12);
        expect(g.outcomes.reduce((s, o) => s + o.p, 0)).toBeCloseTo(1, 12);
      }
    }
  });
  it('a sports bet returns 1/(1+margin) on average', () => {
    const g = { id: 'sportsBet' as const, outcomes: sportsBet(2.5, 0.06) };
    expect(expectedReturn(g)).toBeCloseTo(1 / 1.06, 12);
  });
  it('the sampler reproduces the distribution', () => {
    const draw = sampler(GAMES.rouletteRed);
    const rand = mulberry32(1);
    let wins = 0;
    const n = 200_000;
    for (let i = 0; i < n; i++) if (draw(rand()) > 0) wins++;
    expect(wins / n).toBeCloseTo(18 / 37, 2);
  });
});

import { payoutTable, simulateSession } from '../src/lib/volatility';

describe('slot volatility model', () => {
  it('gives the exact requested RTP for every volatility', () => {
    for (const v of ['low', 'medium', 'high'] as const) {
      const t = payoutTable(v, 0.95);
      expect(t.reduce((s, o) => s + o.probability, 0)).toBeCloseTo(1, 10);
      expect(t.reduce((s, o) => s + o.multiplier * o.probability, 0)).toBeCloseTo(0.95, 10);
    }
  });

  it('is reproducible with a seed and ruins more players at high volatility', () => {
    const a = simulateSession({ bankroll: 100, bet: 1, spins: 500, rtp: 0.95, volatility: 'high', seed: 3 });
    const b = simulateSession({ bankroll: 100, bet: 1, spins: 500, rtp: 0.95, volatility: 'high', seed: 3 });
    expect(a.finalBalance).toBe(b.finalBalance);
    const bust = (v: 'low' | 'high') => Array.from({ length: 300 }, (_, i) => simulateSession({ bankroll: 100, bet: 1, spins: 500, rtp: 0.95, volatility: v, seed: i + 1 }).busted).filter(Boolean).length;
    expect(bust('high')).toBeGreaterThan(bust('low'));
  });
});
