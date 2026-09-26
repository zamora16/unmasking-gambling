/**
 * Personal plan builder. Reads the screening result (if any) and branches on
 * severity, channel and triggers via the pure engine in src/lib/plan.ts.
 */
import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { buildPlan, type Channel, type GameKind, type Goal, type TriggerId } from '../../lib/plan';
import { loadJourney, nextReviewDate, saveJourney } from '../../lib/journey';
import { bandForScore } from '../../lib/pgsi';
import type { TheWayStrings } from '../../data/camino/way';
import { PlanView } from './PlanView';

interface Props {
  t: TheWayStrings['plan'];
  pgsiStrings: TheWayStrings['pgsi'];
  lang: 'es' | 'en';
  screeningHref: string;
  printHref: string;
}

const GOALS: Goal[] = ['maintain', 'reduce', 'stop'];
const CHANNELS: Channel[] = ['online', 'venue', 'lottery-shop'];
const GAMES: GameKind[] = ['slots', 'sports', 'casino', 'lottery', 'poker'];
const TRIGGERS: TriggerId[] = ['stress', 'boredom', 'alcohol', 'social', 'money-trouble', 'low-mood', 'payday', 'sport-events'];

const toggle = <T,>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

export default function PlanBuilder({ t, pgsiStrings, lang, screeningHref, printHref }: Props) {
  const [hydrated, setHydrated] = useState(false);
  const [pgsiScore, setPgsiScore] = useState<number | null>(null);
  const [goal, setGoal] = useState<Goal>('reduce');
  const [channels, setChannels] = useState<Channel[]>([]);
  const [games, setGames] = useState<GameKind[]>([]);
  const [triggers, setTriggers] = useState<TriggerId[]>([]);
  const [hasSupport, setHasSupport] = useState(false);
  const [supportName, setSupportName] = useState('');
  const [built, setBuilt] = useState(false);

  useEffect(() => {
    const j = loadJourney();
    setPgsiScore(j.pgsi.score);
    setGoal(j.plan.goal);
    setChannels(j.plan.channels);
    setGames(j.plan.games);
    setTriggers(j.plan.triggers);
    setHasSupport(j.plan.hasSupport);
    setSupportName(j.plan.supportName);
    setBuilt(Boolean(j.plan.builtAt));
    setHydrated(true);
  }, []);

  const plan = useMemo(() => buildPlan({ pgsiScore, goal, channels, games, triggers, hasSupport }), [pgsiScore, goal, channels, games, triggers, hasSupport]);

  const generate = () => {
    const j = loadJourney();
    saveJourney({ ...j, plan: { goal, channels, games, triggers, hasSupport, supportName, builtAt: new Date().toISOString() } });
    setBuilt(true);
    requestAnimationFrame(() => document.getElementById('plan-result')?.focus());
  };

  if (!hydrated) return <div className="cam-skeleton" aria-hidden="true" />;

  const band = pgsiScore !== null ? bandForScore(pgsiScore) : null;

  return (
    <div className="cam">
      <div className="cam-card">
        <p>{t.intro}</p>
        {band ? (
          <p className="cam-tags">
            <span className="tag">
              {pgsiStrings.scoreLabel}: <strong className="num">{pgsiScore}</strong>
            </span>
            <span className={`tag band-${band.band}`}>{pgsiStrings.bands[band.band].name}</span>
          </p>
        ) : (
          <p>
            <a href={screeningHref}>{pgsiStrings.resultTitle} →</a>
          </p>
        )}
      </div>

      <div className="cam-card form">
        <Choices legend={t.goalLabel} name="goal" multi={false} options={GOALS.map((id) => ({ id, label: t.goals[id] }))} selected={[goal]} onToggle={(id) => setGoal(id)} />
        <Choices legend={t.channelLabel} name="channel" multi options={CHANNELS.map((id) => ({ id, label: t.channels[id] }))} selected={channels} onToggle={(id) => setChannels((p) => toggle(p, id))} />
        <Choices legend={t.gamesLabel} name="games" multi options={GAMES.map((id) => ({ id, label: t.games[id] }))} selected={games} onToggle={(id) => setGames((p) => toggle(p, id))} />
        <Choices legend={t.triggersLabel} name="triggers" multi options={TRIGGERS.map((id) => ({ id, label: t.triggers[id] }))} selected={triggers} onToggle={(id) => setTriggers((p) => toggle(p, id))} />
        <Choices
          legend={t.supportLabel}
          name="support"
          multi={false}
          options={[
            { id: 'yes', label: t.supportYes },
            { id: 'no', label: t.supportNo },
          ]}
          selected={[hasSupport ? 'yes' : 'no']}
          onToggle={(id) => setHasSupport(id === 'yes')}
        >
          {hasSupport && (
            <label className="cam-field">
              <span>{t.supportNameLabel}</span>
              <input type="text" value={supportName} onChange={(e) => setSupportName(e.target.value)} autoComplete="off" />
            </label>
          )}
        </Choices>
        <div>
          <button type="button" className="btn" onClick={generate}>
            {t.buildCta}
          </button>
        </div>
      </div>

      {built && (
        <div id="plan-result" className="cam" tabIndex={-1}>
          {plan.warnings.map((w) => (
            <p key={w} className={`cam-note${w === 'goal-below-severity' ? ' house' : ''}`} role="note">
              {t.warnings[w]}
            </p>
          ))}
          <div className="cam-plan">
            <p className="plan-title">{t.resultTitle}</p>
            <PlanView t={t} plan={plan} supportName={supportName} reviewDate={nextReviewDate(plan.reviewDays)} lang={lang} />
          </div>
          <div className="cam-actions">
            <a className="btn" href={printHref}>
              {t.printCta}
            </a>
          </div>
          <p className="cam-small">{t.privacyNote}</p>
        </div>
      )}
    </div>
  );
}

function Choices<T extends string>({
  legend,
  name,
  options,
  selected,
  onToggle,
  multi,
  children,
}: {
  legend: string;
  name: string;
  options: Array<{ id: T; label: string }>;
  selected: T[];
  onToggle: (id: T) => void;
  multi: boolean;
  children?: ReactNode;
}) {
  return (
    <fieldset className="cam-group">
      <legend>{legend}</legend>
      <div className="cam-choices">
        {options.map((o) => {
          const on = selected.includes(o.id);
          return (
            <label key={o.id} className={`cam-choice${on ? ' on' : ''}`}>
              <input type={multi ? 'checkbox' : 'radio'} name={`plan-${name}`} checked={on} onChange={() => onToggle(o.id)} />
              {o.label}
            </label>
          );
        })}
      </div>
      {children}
    </fieldset>
  );
}
