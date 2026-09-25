import { describe, expect, it } from 'vitest';
import { simulateRuin } from '../src/lib/montecarlo';
import { GAMES } from '../src/lib/games';

const base = {
  game: GAMES.rouletteRed,
  players: 4000,
  rounds: 500,
  bankroll: 100,
  stake: 1,
  strategy: 'flat' as const,
  target: 0,
  maxStake: 1e9,
  seed: 42,
};

describe('Monte Carlo ruin', () => {
  it('is deterministic for a given seed', () => {
    const a = simulateRuin(base);
    const b = simulateRuin(base);
    expect(a.meanFinal).toBe(b.meanFinal);
  });
  it('loses on average what the edge predicts', () => {
    const r = simulateRuin(base);
    const expected = base.bankroll - r.expectedLossFromEdge;
    // standard error of the mean final bankroll is ~ sqrt(rounds)/sqrt(players)
    expect(Math.abs(r.meanFinal - expected)).toBeLessThan(1.5);
  });
  it('a fair coin loses nothing on average', () => {
    const r = simulateRuin({ ...base, game: GAMES.fairCoin });
    expect(Math.abs(r.meanFinal - base.bankroll)).toBeLessThan(1.5);
  });
  it('flat betting roulette: ruin probability matches the gambler’s ruin formula', () => {
    // Start 20, target 40, 1-unit bets on red: P(ruin) = ((q/p)^20 - (q/p)^40) / (1 - (q/p)^40)
    const p = 18 / 37;
    const q = 1 - p;
    const rr = q / p;
    const exact = (rr ** 20 - rr ** 40) / (1 - rr ** 40);
    const r = simulateRuin({ ...base, bankroll: 20, target: 40, rounds: 100_000, players: 20_000 });
    expect(r.ruinedShare).toBeCloseTo(exact, 1);
    expect(r.ruinedShare + r.targetShare).toBeCloseTo(1, 5);
  });
  it('Martingale wins often but not on average', () => {
    const r = simulateRuin({ ...base, strategy: 'martingale', rounds: 200 });
    expect(r.meanFinal).toBeLessThan(base.bankroll);
  });
});
