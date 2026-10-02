import { describe, expect, it } from 'vitest';
import { reminderIcs } from '../src/lib/ics';
import { progressStats, daysBetween } from '../src/lib/progress';
import { payoff } from '../src/lib/debts';

describe('calendar reminder', () => {
  it('is a valid all-day event with an alarm', () => {
    const ics = reminderIcs({ date: new Date(2026, 9, 16), title: 'Revisar mi plan; sin jugar', description: 'Línea 1\nLínea 2', uid: 'x@ug', repeatDays: 14, count: 6 }, new Date(Date.UTC(2026, 9, 2, 10)));
    expect(ics).toContain('DTSTART;VALUE=DATE:20261016');
    expect(ics).toContain('DTEND;VALUE=DATE:20261017');
    expect(ics).toContain(String.raw`SUMMARY:Revisar mi plan\; sin jugar`);
    expect(ics).toContain('RRULE:FREQ=DAILY;INTERVAL=14;COUNT=6');
    expect(ics).toContain('BEGIN:VALARM');
    expect(ics.split('\r\n').every((l) => l.length <= 75)).toBe(true);
  });
});

describe('progress', () => {
  it('counts days without resetting on a lapse', () => {
    expect(daysBetween('2026-09-30', '2026-10-02')).toBe(2);
    const s = progressStats({ start: '2026-09-01', weekly: 70, lapses: ['2026-09-20'], urges: 0 }, '2026-09-30')!;
    expect(s.days).toBe(30);
    expect(s.cleanDays).toBe(29);
    expect(s.sinceLast).toBe(10);
    expect(s.kept).toBeCloseTo(290, 6);
  });

  it('with no lapse, days since last equals days since the start', () => {
    const s = progressStats({ start: '2026-10-01', weekly: 0, lapses: [], urges: 0 }, '2026-10-02')!;
    expect(s.days).toBe(2);
    expect(s.sinceLast).toBe(1);
  });
});

describe('debt payoff', () => {
  it('clears a single interest-free debt in balance/budget months', () => {
    const r = payoff([{ name: 'a', balance: 1000, rate: 0, min: 50 }], 100);
    expect(r.months).toBe(10);
    expect(r.totalInterest).toBe(0);
  });

  it('pays the most expensive debt first', () => {
    const r = payoff(
      [
        { name: 'cheap', balance: 1000, rate: 0.05, min: 20 },
        { name: 'dear', balance: 1000, rate: 0.6, min: 20 },
      ],
      200,
    );
    expect(r.order[0]).toBe('dear');
  });

  it('flags a budget that cannot cover the minimums or the interest', () => {
    const r = payoff([{ name: 'a', balance: 10000, rate: 0.6, min: 300 }], 200);
    expect(r.shortfall).toBe(100);
    expect(r.months).toBeNull();
  });
});
