/**
 * Days and money since deciding to stop. A lapse is recorded, not punished:
 * the count of days without gambling never goes back to zero.
 */
import { useEffect, useState } from 'react';
import { emptyProgress, isoDay, loadProgress, progressStats, saveProgress, type Progress } from '../../lib/progress';
import { fmt, type Lang } from '../../i18n';

const T = {
  es: {
    title: 'Mi progreso',
    intro: 'Apunta el día en que empezaste a dejarlo o a reducir. Si quieres, añade lo que solías gastar a la semana y verás el dinero que no se va.',
    startLabel: 'Empecé el',
    weeklyLabel: 'Gastaba a la semana (opcional)',
    startCta: 'Empezar a contar',
    days: 'Días desde que empezaste',
    clean: 'Días sin jugar',
    since: 'Días desde la última vez',
    kept: 'Dinero que no se ha ido',
    urges: 'Impulsos que dejaste pasar',
    lapse: 'Hoy he jugado',
    undo: 'Deshacer',
    lapseMsg:
      'Gracias por apuntarlo. Una recaída no borra lo que llevas: tus días sin jugar siguen ahí. Piensa qué la desencadenó y añádelo a tu plan. Si te cuesta volver, habla hoy con alguien.',
    reset: 'Borrar y empezar de nuevo',
    confirm: '¿Seguro? Se borrarán tus fechas y tus cifras.',
    note: 'Se guarda solo en este navegador.',
  },
  en: {
    title: 'My progress',
    intro: 'Note the day you started stopping or cutting down. If you like, add what you used to spend per week and you will see the money that stays with you.',
    startLabel: 'I started on',
    weeklyLabel: 'I spent per week (optional)',
    startCta: 'Start counting',
    days: 'Days since you started',
    clean: 'Days without gambling',
    since: 'Days since the last time',
    kept: 'Money that stayed with you',
    urges: 'Urges you let pass',
    lapse: 'I gambled today',
    undo: 'Undo',
    lapseMsg:
      'Thank you for noting it. A lapse does not erase what you have done: your days without gambling are still there. Think about what set it off and add it to your plan. If getting back on track is hard, talk to someone today.',
    reset: 'Clear and start again',
    confirm: 'Are you sure? Your dates and figures will be deleted.',
    note: 'Saved only in this browser.',
  },
};

export default function ProgressTracker({ lang }: { lang: Lang }) {
  const t = T[lang];
  const f = fmt(lang);
  const [p, setP] = useState<Progress | null>(null);
  const [startDraft, setStartDraft] = useState(isoDay(new Date()));
  const [weeklyDraft, setWeeklyDraft] = useState(0);
  const [justLapsed, setJustLapsed] = useState(false);
  useEffect(() => setP(loadProgress()), []);
  if (!p) return <div className="cam-skeleton" aria-hidden="true" />;

  const update = (next: Progress) => {
    setP(next);
    saveProgress(next);
  };
  const today = isoDay(new Date());
  const stats = progressStats(p, today);
  const lapsedToday = p.lapses.includes(today);

  return (
    <div className="cam-card progress">
      <p className="plan-title">{t.title}</p>
      {!stats ? (
        <>
          <p>{t.intro}</p>
          <div className="cam-choices">
            <label className="cam-field">
              <span>{t.startLabel}</span>
              <input type="date" value={startDraft} max={today} onChange={(e) => setStartDraft(e.target.value)} />
            </label>
            <label className="cam-field">
              <span>{t.weeklyLabel}</span>
              <input type="number" min={0} step={10} value={weeklyDraft} onChange={(e) => setWeeklyDraft(Math.max(0, Number(e.target.value)))} />
            </label>
          </div>
          <div className="cam-actions">
            <button type="button" className="btn" onClick={() => update({ ...p, start: startDraft || today, weekly: weeklyDraft })}>
              {t.startCta}
            </button>
          </div>
        </>
      ) : (
        <>
          <dl className="progress-tiles">
            <div>
              <dt>{t.clean}</dt>
              <dd className="num">{f.int(stats.cleanDays)}</dd>
            </div>
            <div>
              <dt>{t.since}</dt>
              <dd className="num">{f.int(stats.sinceLast)}</dd>
            </div>
            <div>
              <dt>{t.days}</dt>
              <dd className="num">{f.int(stats.days)}</dd>
            </div>
            {p.weekly > 0 && (
              <div>
                <dt>{t.kept}</dt>
                <dd className="num">{f.eur(stats.kept)}</dd>
              </div>
            )}
            {p.urges > 0 && (
              <div>
                <dt>{t.urges}</dt>
                <dd className="num">{f.int(p.urges)}</dd>
              </div>
            )}
          </dl>
          <div className="cam-actions">
            {!lapsedToday ? (
              <button
                type="button"
                className="btn ghost small"
                onClick={() => {
                  update({ ...p, lapses: [...p.lapses, today] });
                  setJustLapsed(true);
                }}
              >
                {t.lapse}
              </button>
            ) : (
              <button
                type="button"
                className="btn ghost small"
                onClick={() => {
                  update({ ...p, lapses: p.lapses.filter((d) => d !== today) });
                  setJustLapsed(false);
                }}
              >
                {t.undo}
              </button>
            )}
            <button
              type="button"
              className="btn ghost small"
              onClick={() => {
                if (window.confirm(t.confirm)) update(emptyProgress());
              }}
            >
              {t.reset}
            </button>
          </div>
          {(justLapsed || lapsedToday) && (
            <p className="cam-note" role="note">
              {t.lapseMsg}
            </p>
          )}
        </>
      )}
      <p className="cam-small">{t.note}</p>
    </div>
  );
}
