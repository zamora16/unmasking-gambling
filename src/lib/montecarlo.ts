import { mulberry32 } from './rng';
import { type Game, sampler, houseEdge } from './games';
import { kaplanMeier } from './survival';
import { quantileSorted, histogram, type Bin } from './stats';

export type Strategy = 'flat' | 'martingale' | 'dalembert';

export interface RuinParams {
  game: Game;
  players: number;
  rounds: number;
  bankroll: number;
  stake: number;
  strategy: Strategy;
  /** Stop (and walk away happy) once the bankroll reaches this. 0 = never. */
  target: number;
  /** Largest stake allowed (a table limit). */
  maxStake: number;
  seed: number;
}

export interface RuinResult {
  checkpoints: number[];
  /** percentile bands of bankroll at each checkpoint */
  bands: { p05: number; p25: number; p50: number; p75: number; p95: number; mean: number }[];
  /** a handful of individual paths, for texture */
  samplePaths: number[][];
  survival: { t: number; s: number; atRisk: number }[];
  ruinedShare: number;
  targetShare: number;
  aheadShare: number;
  finalHistogram: Bin[];
  meanFinal: number;
  medianFinal: number;
  totalWagered: number;
  meanWageredPerPlayer: number;
  expectedLossFromEdge: number;
  edge: number;
  medianRuinRound: number | null;
  totalRounds: number;
}

const SAMPLE_PATHS = 12;

/** Simulate many independent players with the same rules.
 *  A player stops when they can no longer cover the next stake (ruin), when
 *  they reach `target`, or when the session ends after `rounds`. */
export function simulateRuin(params: RuinParams): RuinResult {
  const { game, players, rounds, bankroll, stake, strategy, target, maxStake, seed } = params;
  const rand = mulberry32(seed);
  const draw = sampler(game);

  const nCheck = Math.min(rounds, 120);
  const checkpoints = Array.from({ length: nCheck + 1 }, (_, i) => Math.round((i * rounds) / nCheck));
  const atCheck = checkpoints.map(() => new Float64Array(players));

  const exitTime = new Float64Array(players);
  const ruined = new Uint8Array(players);
  const reached = new Uint8Array(players);
  const finals = new Float64Array(players);
  const samplePaths: number[][] = [];
  let wagered = 0;

  for (let i = 0; i < players; i++) {
    let b = bankroll;
    let bet = stake;
    let t = 0;
    let ck = 1;
    atCheck[0][i] = b;
    const keep = i < SAMPLE_PATHS;
    const path: number[] = keep ? [b] : [];
    let stopped = false;

    while (t < rounds) {
      const s = Math.min(bet, maxStake, b);
      if (s < stake || b <= 0) {
        // cannot cover the minimum stake: ruined
        ruined[i] = 1;
        stopped = true;
        break;
      }
      const pay = draw(rand()) * s;
      wagered += s;
      b = b - s + pay;
      t++;
      const won = pay > s;
      if (strategy === 'martingale') bet = won ? stake : bet * 2;
      else if (strategy === 'dalembert') bet = won ? Math.max(stake, bet - stake) : bet + stake;

      while (ck < checkpoints.length && checkpoints[ck] === t) {
        atCheck[ck][i] = b;
        if (keep) path.push(b);
        ck++;
      }
      if (target > 0 && b >= target) {
        reached[i] = 1;
        stopped = true;
        break;
      }
    }
    // fill the remaining checkpoints with the frozen bankroll
    for (; ck < checkpoints.length; ck++) {
      atCheck[ck][i] = b;
      if (keep) path.push(b);
    }
    if (!stopped && b < stake) ruined[i] = 1;
    exitTime[i] = t;
    finals[i] = b;
    if (keep) samplePaths.push(path);
  }

  const bands = atCheck.map((col) => {
    const sorted = Float64Array.from(col).sort();
    let m = 0;
    for (let i = 0; i < sorted.length; i++) m += sorted[i];
    return {
      p05: quantileSorted(sorted, 0.05),
      p25: quantileSorted(sorted, 0.25),
      p50: quantileSorted(sorted, 0.5),
      p75: quantileSorted(sorted, 0.75),
      p95: quantileSorted(sorted, 0.95),
      mean: m / sorted.length,
    };
  });

  const survival = kaplanMeier(exitTime, ruined);
  const sortedFinals = Float64Array.from(finals).sort();
  let ahead = 0;
  let sumFinal = 0;
  let nRuined = 0;
  let nReached = 0;
  let totalRounds = 0;
  for (let i = 0; i < players; i++) {
    if (finals[i] > bankroll) ahead++;
    sumFinal += finals[i];
    nRuined += ruined[i];
    nReached += reached[i];
    totalRounds += exitTime[i];
  }
  const hiEdge = Math.max(bankroll * 2, target || 0, quantileSorted(sortedFinals, 0.99));
  const edge = houseEdge(game);
  const ruinTimes = Array.from(exitTime).filter((_, i) => ruined[i]).sort((a, b) => a - b);

  return {
    checkpoints,
    bands,
    samplePaths,
    survival,
    ruinedShare: nRuined / players,
    targetShare: nReached / players,
    aheadShare: ahead / players,
    finalHistogram: histogram(finals, 40, 0, hiEdge),
    meanFinal: sumFinal / players,
    medianFinal: quantileSorted(sortedFinals, 0.5),
    totalWagered: wagered,
    meanWageredPerPlayer: wagered / players,
    expectedLossFromEdge: (edge * wagered) / players,
    edge,
    totalRounds,
    medianRuinRound: ruinTimes.length > players / 2 ? ruinTimes[Math.floor(players / 2)] : null,
  };
}
