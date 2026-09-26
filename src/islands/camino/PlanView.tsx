/** The generated plan, shared by the on-screen builder and the printable page. */
import type { PlanOutput } from '../../lib/plan';
import type { TheWayStrings } from '../../data/camino/way';

const PLACEHOLDERS = ['la persona acordada', 'the agreed person'];

function withName(text: string, name: string) {
  if (!name.trim()) return text;
  return PLACEHOLDERS.reduce((s, p) => s.replace(p, name.trim()), text);
}

export function PlanView({
  t,
  plan,
  supportName,
  reviewDate,
  lang,
}: {
  t: TheWayStrings['plan'];
  plan: PlanOutput;
  supportName: string;
  reviewDate: Date;
  lang: 'es' | 'en';
}) {
  const date = reviewDate.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  return (
    <div className="plan-body">
      <section>
        <h3>{t.goalSection}</h3>
        <p className="plan-goal">{t.goals[plan.recommendedGoal]}</p>
      </section>

      {plan.barriers.length > 0 && (
        <section>
          <h3>{t.barriersSection}</h3>
          <ol className="plan-list">
            {plan.barriers.map((b) => (
              <li key={b}>
                <strong>{t.barriers[b].title}</strong>
                <span>{t.barriers[b].how}</span>
              </li>
            ))}
          </ol>
        </section>
      )}

      {plan.triggerTactics.length > 0 && (
        <section>
          <h3>{t.triggersSection}</h3>
          <ul className="plan-list plain">
            {plan.triggerTactics.map(({ trigger, tactic }) => (
              <li key={trigger}>
                <strong>{t.tactics[tactic].title}</strong>
                <span>{t.tactics[tactic].how}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h3>{t.emergencySection}</h3>
        <ol className="plan-list steps">
          {plan.emergencySteps.map((s) => (
            <li key={s}>
              <span>{withName(t.emergencySteps[s], supportName)}</span>
            </li>
          ))}
        </ol>
      </section>

      {plan.referral !== 'none' && (
        <section>
          <h3>{t.referralSection}</h3>
          <p>{t.referral[plan.referral]}</p>
        </section>
      )}

      <section>
        <h3>{t.reviewSection}</h3>
        <p>{t.reviewEvery.replace('{n}', String(plan.reviewDays)).replace('{date}', date)}</p>
      </section>
    </div>
  );
}
