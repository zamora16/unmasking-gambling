import { describe, expect, it } from 'vitest';
import { bandForScore, scorePgsi, topConcerns, SEVERITY_BANDS, type PgsiAnswer } from '../src/lib/pgsi';
import { buildPlan, type PlanProfile } from '../src/lib/plan';
import { theWayContent } from '../src/data/camino/way';

const answers = (...a: PgsiAnswer[]) => a;

describe('PGSI', () => {
  it('scores only complete answer sets', () => {
    expect(scorePgsi(answers(0, 1, 2, 3, 0, 1, 2, 3, 0))).toBe(12);
    expect(scorePgsi([0, 1, null, 0, 0, 0, 0, 0, 0])).toBeNull();
    expect(scorePgsi([0, 1])).toBeNull();
  });

  it('uses the published cut-offs 0 / 1–2 / 3–7 / 8+', () => {
    const band = (s: number) => bandForScore(s).band;
    expect([0, 1, 2, 3, 7, 8, 27].map(band)).toEqual(['none', 'low', 'low', 'moderate', 'moderate', 'problem', 'problem']);
  });

  it('bands cover 0–27 without gaps', () => {
    for (let s = 0; s <= 27; s++) expect(SEVERITY_BANDS.filter((b) => s >= b.min && s <= b.max)).toHaveLength(1);
  });

  it('reports the heaviest items first, only when they score 2 or more', () => {
    expect(topConcerns(answers(1, 3, 0, 2, 0, 0, 3, 0, 1))).toEqual([1, 6]);
    expect(topConcerns(answers(1, 1, 1, 1, 1, 1, 1, 1, 1))).toEqual([]);
  });
});

describe('plan engine', () => {
  const base: PlanProfile = { pgsiScore: 0, goal: 'maintain', channels: [], games: [], triggers: [], hasSupport: true };

  it('lets severity override a goal below it', () => {
    const p = buildPlan({ ...base, pgsiScore: 12, goal: 'reduce', channels: ['online'] });
    expect(p.recommendedGoal).toBe('stop');
    expect(p.warnings).toContain('goal-below-severity');
  });

  it('never lowers a stricter goal the person chose', () => {
    expect(buildPlan({ ...base, pgsiScore: 0, goal: 'stop' }).recommendedGoal).toBe('stop');
  });

  it('keeps barriers proportionate to severity', () => {
    const low = buildPlan({ ...base, pgsiScore: 0, channels: ['lottery-shop'] });
    expect(low.barriers).not.toContain('money-custodian');
    const high = buildPlan({ ...base, pgsiScore: 15, channels: ['lottery-shop'] });
    expect(high.barriers).toEqual(expect.arrayContaining(['money-custodian', 'bank-block']));
  });

  it('picks barriers by channel', () => {
    const online = buildPlan({ ...base, pgsiScore: 5, channels: ['online'] });
    expect(online.barriers[0]).toBe('rgiaj');
    expect(online.barriers).not.toContain('venue-exclusion');
  });

  it('escalates the urge protocol and review cadence', () => {
    const none = buildPlan({ ...base, pgsiScore: 0 });
    const problem = buildPlan({ ...base, pgsiScore: 20 });
    expect(none.emergencySteps).not.toContain('call-helpline');
    expect(problem.emergencySteps[0]).toBe('hand-over-cards');
    expect(problem.emergencySteps.at(-1)).toBe('call-helpline');
    expect(problem.reviewDays).toBeLessThan(none.reviewDays);
    expect(problem.referral).toBe('recommended');
  });

  it('flags a missing screen and missing support', () => {
    const p = buildPlan({ ...base, pgsiScore: null, hasSupport: false });
    expect(p.warnings).toContain('no-screening');
  });

  it('has copy for every id the engine can emit, in both languages', () => {
    for (const lang of ['es', 'en'] as const) {
      const t = theWayContent[lang];
      expect(t.pgsi.items).toHaveLength(9);
      const p = buildPlan({ pgsiScore: 20, goal: 'reduce', channels: ['online', 'venue', 'lottery-shop'], games: [], triggers: ['stress', 'boredom', 'alcohol', 'social', 'money-trouble', 'low-mood', 'payday', 'sport-events'], hasSupport: true });
      for (const b of p.barriers) expect(t.plan.barriers[b]?.title).toBeTruthy();
      for (const { tactic } of p.triggerTactics) expect(t.plan.tactics[tactic]?.title).toBeTruthy();
      for (const s of p.emergencySteps) expect(t.plan.emergencySteps[s]).toBeTruthy();
    }
  });
});
