/**
 * PGSI screening (Problem Gambling Severity Index, Ferris & Wynne 2001).
 * Nine items on a 0–3 scale, published cut-offs. The "this is not a diagnosis"
 * notice appears before answering and again next to the result.
 */
import { useEffect, useMemo, useState } from 'react';
import { PGSI_ITEM_COUNT, PGSI_MAX_SCORE, SEVERITY_BANDS, bandForScore, scorePgsi, topConcerns, type PgsiAnswer } from '../../lib/pgsi';
import { loadJourney, saveJourney } from '../../lib/journey';
import type { TheWayStrings } from '../../data/camino/way';

interface Props {
  t: TheWayStrings['pgsi'];
  planHref: string;
}

const empty = (): Array<PgsiAnswer | null> => Array(PGSI_ITEM_COUNT).fill(null);

export default function Pgsi({ t, planHref }: Props) {
  const [answers, setAnswers] = useState(empty);
  const [submitted, setSubmitted] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const j = loadJourney();
    if (j.pgsi.completedAt) {
      setAnswers(j.pgsi.answers);
      setSubmitted(true);
    }
    setHydrated(true);
  }, []);

  const score = useMemo(() => scorePgsi(answers), [answers]);
  const remaining = answers.filter((a) => a === null).length;
  const band = score !== null ? bandForScore(score) : null;
  const concerns = useMemo(() => topConcerns(answers), [answers]);

  const setAnswer = (i: number, v: PgsiAnswer) =>
    setAnswers((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });

  const submit = () => {
    if (score === null) return;
    setSubmitted(true);
    const j = loadJourney();
    saveJourney({ ...j, pgsi: { answers, score, completedAt: new Date().toISOString() } });
    requestAnimationFrame(() => document.getElementById('pgsi-result')?.focus());
  };

  const retake = () => {
    setAnswers(empty());
    setSubmitted(false);
    const j = loadJourney();
    saveJourney({ ...j, pgsi: { answers: empty(), score: null, completedAt: null } });
  };

  if (!hydrated) return <div className="cam-skeleton" aria-hidden="true" />;

  if (!submitted || score === null || !band) {
    return (
      <div className="cam">
        <div className="cam-card">
          <p>{t.intro}</p>
          <p className="cam-timeframe">{t.timeframe}</p>
          <p className="cam-note">{t.disclaimer}</p>
        </div>

        <ol className="pgsi-items">
          {t.items.map((item, i) => (
            <li key={i} className="cam-card">
              <fieldset>
                <legend>
                  <span className="pgsi-n">{String(i + 1).padStart(2, '0')}</span>
                  <span>{item}</span>
                </legend>
                <div className="pgsi-scale">
                  {t.scale.map((label, v) => (
                    <label key={v} className={`cam-choice${answers[i] === v ? ' on' : ''}`}>
                      <input type="radio" name={`pgsi-${i}`} value={v} checked={answers[i] === v} onChange={() => setAnswer(i, v as PgsiAnswer)} />
                      <span className="dot" aria-hidden="true" />
                      {label}
                    </label>
                  ))}
                </div>
              </fieldset>
            </li>
          ))}
        </ol>

        <div className="cam-actions">
          <button type="button" className="btn" onClick={submit} disabled={score === null}>
            {t.submit}
          </button>
          {remaining > 0 && (
            <p className="cam-muted" role="status">
              {t.incomplete.replace('{n}', String(remaining))}
            </p>
          )}
        </div>
        <p className="cam-small">{t.attribution}</p>
      </div>
    );
  }

  const b = t.bands[band.band];
  return (
    <div className="cam">
      <div id="pgsi-result" className={`cam-card pgsi-result band-${band.band}`} tabIndex={-1}>
        <p className="panel-label">{t.resultTitle}</p>
        <p className="pgsi-score">
          <strong>{score}</strong>
          <span>/ {PGSI_MAX_SCORE}</span>
          <span className="cam-muted">{t.scoreLabel}</span>
        </p>

        <div className="pgsi-meter" aria-hidden="true">
          <div className="track">
            {SEVERITY_BANDS.map((s) => (
              <span key={s.band} className={`seg band-${s.band}`} style={{ flexGrow: s.max - s.min + 1 }} />
            ))}
          </div>
          <span className="mark" style={{ left: `${((score + 0.5) / (PGSI_MAX_SCORE + 1)) * 100}%` }} />
          <div className="ticks">
            {SEVERITY_BANDS.map((s) => (
              <span key={s.band} style={{ flexGrow: s.max - s.min + 1 }}>
                {s.min}
              </span>
            ))}
          </div>
        </div>

        <h3 className="band-name">{b.name}</h3>
        <p>{b.meaning}</p>
        <p className="strong">{b.advice}</p>

        {concerns.length > 0 && (
          <>
            <p className="panel-label">{t.concernsLabel}</p>
            <ul className="concerns">
              {concerns.map((i) => (
                <li key={i}>{t.items[i]}</li>
              ))}
            </ul>
          </>
        )}
      </div>

      <p className="cam-note">{t.disclaimer}</p>

      <div className="cam-actions">
        <a className="btn" href={planHref}>
          {t.continueCta}
        </a>
        <button type="button" className="btn ghost" onClick={retake}>
          {t.retake}
        </button>
      </div>
      <p className="cam-small">{t.savedNote}</p>
      <p className="cam-small">{t.attribution}</p>
    </div>
  );
}
