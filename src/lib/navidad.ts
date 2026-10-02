/**
 * Spanish Christmas Lottery (Sorteo Extraordinario de Navidad). The prize
 * programme is exact; the per-décimo payout distribution, where prizes can
 * stack, comes from analysis/navidad/prizes.py (src/data/navidad.json).
 */
import data from '../data/navidad.json';
import { mulberry32 } from './rng';

export const NUMBERS = 100_000;
export const PRICE = data.price;

/** Prize categories of one draw, per décimo (a tenth of a series). */
export const PROGRAMME = [
  { key: 'first', count: 1, perDecimo: 400_000 },
  { key: 'second', count: 1, perDecimo: 125_000 },
  { key: 'third', count: 1, perDecimo: 50_000 },
  { key: 'fourth', count: 2, perDecimo: 20_000 },
  { key: 'fifth', count: 8, perDecimo: 6_000 },
  { key: 'approxFirst', count: 2, perDecimo: 2_000 },
  { key: 'approxSecond', count: 2, perDecimo: 1_250 },
  { key: 'approxThird', count: 2, perDecimo: 960 },
  { key: 'pedrea', count: 1_794, perDecimo: 100 },
  { key: 'hundreds', count: 495, perDecimo: 100 },
  { key: 'lastTwo', count: 2_997, perDecimo: 100 },
  { key: 'refund', count: 9_999, perDecimo: 20 },
] as const;
export type PrizeKey = (typeof PROGRAMME)[number]['key'];

/** What the tax office keeps from one décimo's prize: 20 % above 40,000 €. */
export function afterTax(gross: number): number {
  return gross - data.taxRate * Math.max(0, gross - data.taxFree);
}

/** Exact chance of ever hitting the Gordo with `tickets` décimos of different draws. */
export function chanceOfGordo(tickets: number): number {
  return 1 - (1 - 1 / NUMBERS) ** tickets;
}

const CUM = (() => {
  let c = 0;
  return data.dist.map((d) => ((c += d.p), { v: d.v, c }));
})();

function draw(u: number): number {
  const x = u * CUM[CUM.length - 1].c;
  let lo = 0;
  let hi = CUM.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (CUM[mid].c < x) lo = mid + 1;
    else hi = mid;
  }
  return CUM[lo].v;
}

export interface LifeResult {
  spent: number;
  /** after tax */
  won: number[];
  shareAhead: number;
  medianNet: number;
  meanNet: number;
  /** chance of at least one prize of 1,000 € or more per décimo */
  shareBigPrize: number;
}

/**
 * `runs` simulated lives of buying `perYear` décimos each Christmas for
 * `years` years. Décimos are treated as independent draws from the
 * per-décimo distribution, which holds for different numbers and years.
 */
export function simulateLives(perYear: number, years: number, runs: number, seed = 1): LifeResult {
  const rand = mulberry32(seed);
  const n = perYear * years;
  const spent = n * PRICE;
  const won: number[] = [];
  let ahead = 0;
  let big = 0;
  let sum = 0;
  for (let r = 0; r < runs; r++) {
    let w = 0;
    let hadBig = false;
    for (let i = 0; i < n; i++) {
      const g = draw(rand());
      if (g >= 1000) hadBig = true;
      w += afterTax(g);
    }
    won.push(w);
    sum += w - spent;
    if (w > spent) ahead++;
    if (hadBig) big++;
  }
  const nets = won.map((w) => w - spent).sort((a, b) => a - b);
  return { spent, won, shareAhead: ahead / runs, medianNet: nets[Math.floor(runs / 2)], meanNet: sum / runs, shareBigPrize: big / runs };
}

export const NAVIDAD = data;
