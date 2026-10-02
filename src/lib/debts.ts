/**
 * A repayment plan for several debts with one monthly budget. Minimum
 * payments go to every debt; whatever is left goes to the most expensive one
 * first (the "avalanche" order), which minimises total interest.
 */

export interface Debt {
  name: string;
  balance: number;
  /** annual interest rate, as a fraction (0.24 = 24 %) */
  rate: number;
  /** minimum monthly payment */
  min: number;
}

export interface PayoffResult {
  /** months until everything is paid, or null if the budget never gets there */
  months: number | null;
  totalInterest: number;
  /** order in which debts are cleared, by name */
  order: string[];
  /** budget below the sum of minimum payments */
  shortfall: number;
}

const MAX_MONTHS = 600;

export function payoff(debts: Debt[], budget: number): PayoffResult {
  const live = debts.filter((d) => d.balance > 0).map((d) => ({ ...d }));
  const minSum = live.reduce((s, d) => s + Math.min(d.min, d.balance), 0);
  const shortfall = Math.max(0, minSum - budget);
  const order: string[] = [];
  let interest = 0;
  let month = 0;
  while (live.some((d) => d.balance > 0.005)) {
    if (month >= MAX_MONTHS) return { months: null, totalInterest: interest, order, shortfall };
    month++;
    for (const d of live) {
      if (d.balance <= 0) continue;
      const i = (d.balance * d.rate) / 12;
      d.balance += i;
      interest += i;
    }
    let money = budget;
    for (const d of live) {
      if (d.balance <= 0) continue;
      const pay = Math.min(d.min, d.balance, money);
      d.balance -= pay;
      money -= pay;
    }
    // avalanche: extra money to the highest rate first
    for (const d of [...live].sort((a, b) => b.rate - a.rate)) {
      if (money <= 0) break;
      if (d.balance <= 0) continue;
      const pay = Math.min(d.balance, money);
      d.balance -= pay;
      money -= pay;
    }
    for (const d of live) if (d.balance <= 0.005 && !order.includes(d.name)) order.push(d.name);
  }
  return { months: month, totalInterest: interest, order, shortfall };
}
