/** Quantile of a sorted typed array with linear interpolation. */
export function quantileSorted(sorted: ArrayLike<number>, q: number): number {
  const n = sorted.length;
  if (n === 0) return NaN;
  const pos = (n - 1) * q;
  const lo = Math.floor(pos);
  const hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

export function mean(xs: ArrayLike<number>): number {
  let s = 0;
  for (let i = 0; i < xs.length; i++) s += xs[i];
  return s / xs.length;
}

export interface Bin {
  x0: number;
  x1: number;
  count: number;
}

export function histogram(xs: ArrayLike<number>, bins: number, lo: number, hi: number): Bin[] {
  const w = (hi - lo) / bins;
  const out: Bin[] = Array.from({ length: bins }, (_, i) => ({ x0: lo + i * w, x1: lo + (i + 1) * w, count: 0 }));
  for (let i = 0; i < xs.length; i++) {
    const k = Math.min(bins - 1, Math.max(0, Math.floor((xs[i] - lo) / w)));
    out[k].count++;
  }
  return out;
}
