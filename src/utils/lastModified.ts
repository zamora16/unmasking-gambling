/**
 * Date of the last commit that touched a set of source files, read at build
 * time. CI must check out the full history (fetch-depth: 0) or every page
 * gets the date of the latest commit.
 */
import { execFileSync } from 'node:child_process';

const cache = new Map<string, string>();

export function lastModified(paths: readonly string[]): string {
  const key = paths.join('|');
  const hit = cache.get(key);
  if (hit) return hit;
  let date = '';
  try {
    date = execFileSync('git', ['log', '-1', '--format=%cs', '--', ...paths], { encoding: 'utf8' }).trim();
  } catch {
    // not a git checkout
  }
  // uncommitted files have no history yet: they are being edited today
  if (!date) date = new Date().toISOString().slice(0, 10);
  cache.set(key, date);
  return date;
}
