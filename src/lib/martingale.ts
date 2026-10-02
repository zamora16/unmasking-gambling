/**
 * The martingale, solved exactly instead of simulated. A "series" starts at
 * the base stake and doubles after every loss; the first win ends it with a
 * net gain of one base stake. The series fails when the next doubled stake
 * no longer fits the bankroll or the table limit.
 */

export interface MartingaleInput {
  bankroll: number;
  base: number;
  /** Largest stake the table accepts. Infinity = no limit. */
  tableLimit: number;
  /** Chance of winning one even-money bet (18/37 on a European wheel). */
  p: number;
}

export interface MartingaleStep {
  /** 1-based bet number within the series */
  n: number;
  stake: number;
  /** total staked so far in the series, this bet included */
  cumulative: number;
  /** chance of having lost every bet before this one */
  reach: number;
}

export interface MartingaleSeries {
  steps: MartingaleStep[];
  /** how many bets in a row the bankroll and the limit allow */
  maxBets: number;
  /** what stops the series: the money or the table limit */
  stoppedBy: 'bankroll' | 'limit';
  /** chance one series ends in a win (+base) */
  pWin: number;
  /** chance one series is lost entirely */
  pLose: number;
  /** what a lost series costs */
  loss: number;
  /** expected result of one series */
  ev: number;
  /** expected amount staked in one series */
  staked: number;
  /** average number of winning series before the first lost one */
  winsBeforeLoss: number;
}

/** Stake sizes and odds of one series, given the bankroll at its start. */
export function martingaleSeries({ bankroll, base, tableLimit, p }: MartingaleInput): MartingaleSeries {
  const q = 1 - p;
  const steps: MartingaleStep[] = [];
  let stake = base;
  let cumulative = 0;
  let reach = 1;
  let stoppedBy: MartingaleSeries['stoppedBy'] = 'bankroll';
  // guard against absurd inputs; 60 doublings is far past any real bankroll
  for (let n = 1; n <= 60; n++) {
    if (stake > tableLimit) {
      stoppedBy = 'limit';
      break;
    }
    if (cumulative + stake > bankroll) {
      stoppedBy = 'bankroll';
      break;
    }
    cumulative += stake;
    steps.push({ n, stake, cumulative, reach });
    reach *= q;
    stake *= 2;
  }
  const maxBets = steps.length;
  const pLose = maxBets ? q ** maxBets : 1;
  const pWin = 1 - pLose;
  const loss = maxBets ? steps[maxBets - 1].cumulative : 0;
  // E[staked] = sum over bets of P(reach bet) * stake
  const staked = steps.reduce((s, st) => s + st.reach * st.stake, 0);
  return {
    steps,
    maxBets,
    stoppedBy,
    pWin,
    pLose,
    loss,
    ev: pWin * base - pLose * loss,
    staked,
    winsBeforeLoss: pLose > 0 ? pWin / pLose : Infinity,
  };
}

/**
 * Chance of adding `goal` to the bankroll before the first lost series,
 * restarting at the base stake after every win. The bankroll grows by one
 * base per won series, so later series may allow one more doubling; that is
 * taken into account exactly.
 */
export function chanceOfGoal(input: MartingaleInput, goal: number): number {
  const wins = Math.ceil(goal / input.base);
  let prob = 1;
  for (let i = 0; i < wins; i++) {
    prob *= martingaleSeries({ ...input, bankroll: input.bankroll + i * input.base }).pWin;
    if (prob < 1e-12) return 0;
  }
  return prob;
}
