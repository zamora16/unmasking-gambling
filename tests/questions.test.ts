import { describe, expect, it } from 'vitest';
import { martingaleSeries, chanceOfGoal } from '../src/lib/martingale';
import { aheadEvenBehind, binomPmf, logGamma } from '../src/lib/binomial';
import { QUESTIONS } from '../src/data/questions';

const RED = 18 / 37;

describe('martingale', () => {
  it('fits as many doublings as the bankroll allows', () => {
    // 1+2+4+8+16+32 = 63 ≤ 100 < 127
    const s = martingaleSeries({ bankroll: 100, base: 1, tableLimit: Infinity, p: RED });
    expect(s.maxBets).toBe(6);
    expect(s.loss).toBe(63);
    expect(s.stoppedBy).toBe('bankroll');
    expect(s.pLose).toBeCloseTo((19 / 37) ** 6, 12);
  });

  it('stops at the table limit', () => {
    const s = martingaleSeries({ bankroll: 1e6, base: 5, tableLimit: 500, p: RED });
    // 5,10,...,320 fit; 640 > 500
    expect(s.steps.map((x) => x.stake)).toEqual([5, 10, 20, 40, 80, 160, 320]);
    expect(s.stoppedBy).toBe('limit');
  });

  it('loses exactly the house edge on everything staked', () => {
    for (const bankroll of [10, 100, 1000, 25000]) {
      const s = martingaleSeries({ bankroll, base: 1, tableLimit: Infinity, p: RED });
      expect(s.ev).toBeCloseTo(-(1 - 2 * RED) * s.staked, 10);
    }
  });

  it('a fair game makes the system break even, no better', () => {
    const s = martingaleSeries({ bankroll: 1000, base: 1, tableLimit: Infinity, p: 0.5 });
    expect(s.ev).toBeCloseTo(0, 12);
  });

  it('chance of a goal shrinks as the goal grows', () => {
    const input = { bankroll: 100, base: 1, tableLimit: Infinity, p: RED };
    const a = chanceOfGoal(input, 10);
    const b = chanceOfGoal(input, 100);
    expect(a).toBeGreaterThan(b);
    expect(b).toBeLessThan(0.5);
  });
});

describe('binomial', () => {
  it('logGamma matches factorials', () => {
    expect(Math.exp(logGamma(6))).toBeCloseTo(120, 8);
    expect(logGamma(101)).toBeCloseTo(363.73937555556347, 8);
  });

  it('pmf sums to one', () => {
    let s = 0;
    for (let k = 0; k <= 50; k++) s += binomPmf(k, 50, 0.3);
    expect(s).toBeCloseTo(1, 12);
  });

  // reference values from scipy.stats.binom
  it('matches scipy for even-money and straight-up bets', () => {
    expect(aheadEvenBehind(100, RED, 1).ahead).toBeCloseTo(0.35535, 4);
    expect(aheadEvenBehind(100, RED, 1).even).toBeCloseTo(0.07673, 4);
    expect(aheadEvenBehind(1000, RED, 1).ahead).toBeCloseTo(0.18763, 4);
    expect(aheadEvenBehind(10000, RED, 1).ahead).toBeCloseTo(0.00333, 4);
    expect(aheadEvenBehind(10000, 1 / 37, 35).ahead).toBeCloseTo(0.32506, 4);
  });
});

describe('question registry', () => {
  it('ids and slugs are unique, answers fit a meta description', () => {
    const ids = QUESTIONS.map((q) => q.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const lang of ['es', 'en'] as const) {
      const slugs = QUESTIONS.map((q) => q.slug[lang]);
      expect(new Set(slugs).size).toBe(slugs.length);
      for (const q of QUESTIONS) expect(q.answer[lang].length).toBeLessThan(320);
    }
  });
});
