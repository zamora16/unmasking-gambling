/** Kaplan–Meier estimator.
 *  times[i]: when individual i left the risk set (ruined or censored).
 *  events[i]: true if the individual was ruined at that time, false if it was
 *  censored (stopped playing for another reason, e.g. hit its target or the
 *  session ended). Returns the survival curve as step points. */
export function kaplanMeier(times: ArrayLike<number>, events: ArrayLike<boolean | number>): { t: number; s: number; atRisk: number }[] {
  const n = times.length;
  const idx = Array.from({ length: n }, (_, i) => i).sort((a, b) => times[a] - times[b]);
  let atRisk = n;
  let s = 1;
  const out = [{ t: 0, s: 1, atRisk: n }];
  let i = 0;
  while (i < n) {
    const t = times[idx[i]];
    let d = 0;
    let c = 0;
    while (i < n && times[idx[i]] === t) {
      if (events[idx[i]]) d++;
      else c++;
      i++;
    }
    if (d > 0) {
      s *= 1 - d / atRisk;
      out.push({ t, s, atRisk });
    }
    atRisk -= d + c;
  }
  return out;
}

/** Evaluate a step curve at time t. */
export function stepAt(curve: { t: number; s: number }[], t: number): number {
  let s = 1;
  for (const p of curve) {
    if (p.t > t) break;
    s = p.s;
  }
  return s;
}
