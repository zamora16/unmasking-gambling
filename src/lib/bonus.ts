/**
 * A casino bonus with a wagering requirement, played on a slot until the
 * requirement is met (the balance becomes cash) or the balance runs out.
 * Simplified: deposit and bonus form one balance, every spin counts 100 %
 * towards the requirement and there is no cap on winnings.
 */
import { mulberry32 } from './rng';
import { payoutTable, spin, type Volatility } from './volatility';

export interface BonusInput {
  deposit: number;
  bonus: number;
  /** times the base amount that must be staked */
  multiplier: number;
  /** whether the requirement applies to the bonus alone or to deposit + bonus */
  base: 'bonus' | 'both';
  rtp: number;
  volatility: Volatility;
  bet: number;
}

export function wageringRequired(b: BonusInput): number {
  return b.multiplier * (b.base === 'bonus' ? b.bonus : b.bonus + b.deposit);
}

/** Expected loss from the edge on the required turnover, ignoring going bust. */
export function edgeCost(b: BonusInput): number {
  return wageringRequired(b) * (1 - b.rtp);
}

export interface BonusResult {
  required: number;
  /** share of players who meet the requirement with money left */
  completed: number;
  /** mean cash at the end (0 for those who went bust) */
  meanCash: number;
  /** mean cash minus the deposit */
  meanNet: number;
  /** share who end with more than they deposited */
  ahead: number;
}

export function simulateBonus(b: BonusInput, runs: number, seed = 1): BonusResult {
  const table = payoutTable(b.volatility, b.rtp);
  const rand = mulberry32(seed);
  const required = wageringRequired(b);
  let completed = 0;
  let cashSum = 0;
  let ahead = 0;
  for (let r = 0; r < runs; r++) {
    let balance = b.deposit + b.bonus;
    let staked = 0;
    while (staked < required && balance >= b.bet) {
      balance -= b.bet;
      staked += b.bet;
      balance += spin(table, rand) * b.bet;
    }
    const done = staked >= required;
    const cash = done ? balance : 0;
    if (done) completed++;
    cashSum += cash;
    if (cash > b.deposit) ahead++;
  }
  return { required, completed: completed / runs, meanCash: cashSum / runs, meanNet: cashSum / runs - b.deposit, ahead: ahead / runs };
}
