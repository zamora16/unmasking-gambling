import { describe, expect, it } from 'vitest';
import { overround, proportional, power, shin } from '../src/lib/odds';

const odds = [1.5, 4.2, 6.5];
const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);

describe('margin removal', () => {
  it('computes the overround', () => {
    expect(overround([2, 2])).toBeCloseTo(0);
    expect(overround([1.9, 1.9])).toBeCloseTo(2 / 1.9 - 1);
  });
  it('every method returns probabilities that sum to one', () => {
    expect(sum(proportional(odds))).toBeCloseTo(1, 10);
    expect(sum(power(odds))).toBeCloseTo(1, 10);
    expect(sum(shin(odds).probs)).toBeCloseTo(1, 10);
  });
  it('power and Shin shorten the long shot more than proportional', () => {
    const p = proportional(odds)[2];
    expect(power(odds)[2]).toBeLessThan(p);
    expect(shin(odds).probs[2]).toBeLessThan(p);
  });
  it('Shin z is zero for fair odds', () => {
    expect(shin([2, 2]).z).toBe(0);
  });
});
