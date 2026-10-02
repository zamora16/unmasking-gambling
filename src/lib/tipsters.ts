/**
 * Tipsters with no skill at all: every pick is a coin flip at odds that
 * carry the bookmaker's margin. Rank them on one season and watch the
 * "best" ones in the next.
 */
import { mulberry32 } from './rng';

export interface Tipster {
  id: number;
  /** ROI per unit staked, season 1 and season 2 */
  roi1: number;
  roi2: number;
  wins1: number;
}

export function simulateTipsters(count: number, picks: number, odds: number, p: number, seed: number): Tipster[] {
  const rand = mulberry32(seed);
  const season = () => {
    let wins = 0;
    for (let i = 0; i < picks; i++) if (rand() < p) wins++;
    return { wins, roi: (wins * odds - picks) / picks };
  };
  const out: Tipster[] = [];
  for (let id = 0; id < count; id++) {
    const s1 = season();
    const s2 = season();
    out.push({ id, roi1: s1.roi, roi2: s2.roi, wins1: s1.wins });
  }
  return out.sort((a, b) => b.roi1 - a.roi1);
}
