/**
 * Printable plan. Rebuilt from the same engine as the screen version, so the
 * printed document can never drift from the on-screen logic.
 */
import { useEffect, useMemo, useState } from 'react';
import { buildPlan } from '../../lib/plan';
import { bandForScore } from '../../lib/pgsi';
import { loadJourney, nextReviewDate, type JourneyState } from '../../lib/journey';
import type { TheWayStrings } from '../../data/camino/way';
import { PlanView } from './PlanView';

interface Props {
  t: TheWayStrings['plan'];
  pgsiStrings: TheWayStrings['pgsi'];
  lang: 'es' | 'en';
  planHref: string;
  emptyMessage: string;
  printLabel: string;
  backLabel: string;
}

export default function PlanPrint({ t, pgsiStrings, lang, planHref, emptyMessage, printLabel, backLabel }: Props) {
  const [journey, setJourney] = useState<JourneyState | null>(null);
  useEffect(() => setJourney(loadJourney()), []);

  const plan = useMemo(() => {
    if (!journey) return null;
    const { goal, channels, games, triggers, hasSupport } = journey.plan;
    return buildPlan({ pgsiScore: journey.pgsi.score, goal, channels, games, triggers, hasSupport });
  }, [journey]);

  if (!journey) return <div className="cam-skeleton" aria-hidden="true" />;

  if (!journey.plan.builtAt || !plan) {
    return (
      <div className="cam-card">
        <p>{emptyMessage}</p>
        <p>
          <a className="btn" href={planHref}>
            {t.buildCta}
          </a>
        </p>
      </div>
    );
  }

  const builtAt = new Date(journey.plan.builtAt);
  const built = builtAt.toLocaleDateString(lang === 'es' ? 'es-ES' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' });
  const band = journey.pgsi.score !== null ? bandForScore(journey.pgsi.score) : null;
  const supportName = journey.plan.supportName;

  return (
    <div className="print-wrap">
      <div className="cam-actions no-print">
        <button type="button" className="btn" onClick={() => window.print()}>
          {printLabel}
        </button>
        <a className="btn ghost" href={planHref}>
          {backLabel}
        </a>
      </div>

      <article className="print-plan">
        <header>
          <h1>{t.resultTitle}</h1>
          <p className="num">{built}</p>
          {band && (
            <p className="cam-muted">
              {pgsiStrings.scoreLabel}: {journey.pgsi.score}/27 · {pgsiStrings.bands[band.band].name}
            </p>
          )}
          {supportName && (
            <p>
              <strong>{t.supportNameLabel.split('(')[0].trim()}:</strong> {supportName}
            </p>
          )}
        </header>
        <PlanView t={t} plan={plan} supportName={supportName} reviewDate={nextReviewDate(plan.reviewDays, builtAt)} lang={lang} />
      </article>

      <p className="cam-small no-print">{t.privacyNote}</p>
    </div>
  );
}
