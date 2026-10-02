/**
 * Progress after deciding to stop or cut down. Kept in the browser only, like
 * the rest of El Camino.
 *
 * A lapse does not reset the count to zero. Treating one slip as "back to day
 * zero" is a known driver of the abstinence-violation effect (if it is all
 * lost anyway, why not keep going). So we show days since the last lapse
 * *and* the share of days without gambling since the start.
 */

const KEY = 'ug.progress.v1';

export interface Progress {
  /** ISO date (YYYY-MM-DD) the person started */
  start: string | null;
  /** what they used to spend on gambling per week, to show money kept */
  weekly: number;
  /** ISO dates of days they gambled since starting */
  lapses: string[];
  /** urges let pass with the 15-minute timer */
  urges: number;
}

export const emptyProgress = (): Progress => ({ start: null, weekly: 0, lapses: [], urges: 0 });

export function loadProgress(): Progress {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...emptyProgress(), ...JSON.parse(raw) } : emptyProgress();
  } catch {
    return emptyProgress();
  }
}

export function saveProgress(p: Progress): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch {
    // private mode: works for this visit only
  }
}

export const isoDay = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Whole days between two ISO dates (b − a). */
export function daysBetween(a: string, b: string): number {
  const [y1, m1, d1] = a.split('-').map(Number);
  const [y2, m2, d2] = b.split('-').map(Number);
  return Math.round((Date.UTC(y2, m2 - 1, d2) - Date.UTC(y1, m1 - 1, d1)) / 86_400_000);
}

export interface ProgressStats {
  /** days since the start, counting today */
  days: number;
  /** days without gambling since the start */
  cleanDays: number;
  /** days since the last lapse (or since the start if there was none) */
  sinceLast: number;
  /** money not spent, from the weekly figure and the clean days */
  kept: number;
}

export function progressStats(p: Progress, today: string): ProgressStats | null {
  if (!p.start) return null;
  const days = Math.max(1, daysBetween(p.start, today) + 1);
  const lapseDays = new Set(p.lapses.filter((d) => d >= p.start! && d <= today));
  const cleanDays = days - lapseDays.size;
  const last = [...lapseDays].sort().pop();
  const sinceLast = last ? daysBetween(last, today) : days - 1;
  return { days, cleanDays, sinceLast, kept: (p.weekly / 7) * cleanDays };
}
