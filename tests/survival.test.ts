import { describe, expect, it } from 'vitest';
import { kaplanMeier, stepAt } from '../src/lib/survival';

describe('Kaplan–Meier', () => {
  it('equals the empirical survival without censoring', () => {
    const t = [1, 2, 2, 3, 5];
    const km = kaplanMeier(t, [1, 1, 1, 1, 1]);
    expect(stepAt(km, 1)).toBeCloseTo(0.8);
    expect(stepAt(km, 2)).toBeCloseTo(0.4);
    expect(stepAt(km, 4)).toBeCloseTo(0.2);
    expect(stepAt(km, 5)).toBeCloseTo(0);
  });
  it('matches a textbook example with censoring', () => {
    // times 3,5+,6,8+,10 ; events at 3,6,10
    const km = kaplanMeier([3, 5, 6, 8, 10], [1, 0, 1, 0, 1]);
    expect(stepAt(km, 3)).toBeCloseTo(0.8);
    expect(stepAt(km, 6)).toBeCloseTo(0.8 * (2 / 3));
    expect(stepAt(km, 10)).toBeCloseTo(0);
  });
});
