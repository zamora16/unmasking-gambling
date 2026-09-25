import { describe, expect, it } from 'vitest';
import { WHEEL, colour, expectation, covers, type BetKind } from '../src/lib/roulette';
import { exactRTP, spinReel, STRIP, payout, WEIGHTS, sevenOdds } from '../src/lib/slot';
import { sixFortyNine, euromillions, choose, drawNumbers } from '../src/lib/lottery';
import { decimalToAmerican, americanToDecimal, decimalToFractional, accumulator, longestLosingStreaks } from '../src/lib/sports';
import { mulberry32 } from '../src/lib/rng';

describe('roulette', () => {
  it('has 37 pockets, 18 red, 18 black, 1 green', () => {
    expect(new Set(WHEEL).size).toBe(37);
    expect(WHEEL.filter((n) => colour(n) === 'red').length).toBe(18);
    expect(WHEEL.filter((n) => colour(n) === 'black').length).toBe(18);
  });
  it('every bet has the same expectation, −1/37', () => {
    const kinds: BetKind[] = ['red', 'black', 'even', 'odd', 'low', 'high', 'dozen1', 'dozen2', 'dozen3'];
    for (const k of kinds) expect(expectation({ kind: k })).toBeCloseTo(-1 / 37, 12);
    for (const n of [0, 7, 36]) expect(expectation({ kind: 'number', number: n })).toBeCloseTo(-1 / 37, 12);
    expect(covers({ kind: 'dozen2' })).toHaveLength(12);
  });
});

describe('slot machine', () => {
  it('each reel has 64 virtual stops', () => {
    for (const w of WEIGHTS) expect(w.reduce((a, b) => a + b, 0)).toBe(64);
  });
  it('has an exact RTP a little below 100%', () => {
    const { rtp, hitRate } = exactRTP();
    expect(rtp).toBeGreaterThan(0.9);
    expect(rtp).toBeLessThan(1);
    expect(hitRate).toBeGreaterThan(0.2);
  });
  it('sampling reproduces the exact RTP', () => {
    const rand = mulberry32(3);
    let paid = 0;
    const n = 400_000;
    for (let i = 0; i < n; i++) paid += payout([0, 1, 2].map((r) => STRIP[spinReel(r, rand())]));
    // the jackpot makes the variance large; allow a generous tolerance
    expect(paid / n).toBeCloseTo(exactRTP().rtp, 1);
  });
  it('the third reel shows the 7 next to the payline far more often than on it', () => {
    const { on, adjacent } = sevenOdds(2);
    expect(adjacent / on).toBeGreaterThan(10);
  });
});

describe('lotteries', () => {
  it('La Primitiva jackpot is 1 in 13,983,816', () => {
    expect(choose(49, 6)).toBe(13_983_816);
    expect(1 / sixFortyNine()[0].p).toBeCloseTo(13_983_816, 0);
  });
  it('EuroMillions jackpot is 1 in 139,838,160', () => {
    expect(1 / euromillions()[0].p).toBeCloseTo(139_838_160, 0);
  });
  it('draws distinct numbers in range', () => {
    const d = drawNumbers(49, 6, mulberry32(1));
    expect(new Set(d).size).toBe(6);
    expect(Math.max(...d)).toBeLessThanOrEqual(49);
  });
});

describe('sports', () => {
  it('converts odds formats', () => {
    expect(decimalToAmerican(2.5)).toBe(150);
    expect(decimalToAmerican(1.5)).toBe(-200);
    expect(americanToDecimal(-200)).toBeCloseTo(1.5);
    expect(decimalToFractional(2.5)).toBe('3/2');
    expect(decimalToFractional(3)).toBe('2/1');
  });
  it('accumulators compound the margin', () => {
    const a = accumulator([2, 2, 2], 0.05);
    expect(a.odds).toBeCloseTo(8);
    expect(a.expectedReturn).toBeCloseTo(1 / 1.05 ** 3, 10);
  });
  it('long losing streaks are normal', () => {
    const s = longestLosingStreaks(100, 0.5, 2000, mulberry32(9));
    const median = [...s].sort((a, b) => a - b)[1000];
    expect(median).toBeGreaterThanOrEqual(5);
  });
});
