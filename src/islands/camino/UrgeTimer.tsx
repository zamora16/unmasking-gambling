/**
 * "I want to gamble right now": a 15-minute timer with one thing to do at a
 * time. Urges rise, peak and fade if they are not acted on; the timer buys
 * that time and keeps a phone number one tap away.
 */
import { useEffect, useRef, useState } from 'react';
import { loadProgress, saveProgress } from '../../lib/progress';
import type { Lang } from '../../i18n';

const TOTAL = 15 * 60;

const T = {
  es: {
    title: 'Tengo ganas de jugar ahora',
    intro: 'Las ganas suben, llegan a un pico y bajan si no les haces caso. No tienes que vencerlas para siempre: solo durante los próximos 15 minutos.',
    start: 'Empezar los 15 minutos',
    steps: [
      'Aléjate del móvil o del sitio donde ibas a jugar. Cambia de habitación o sal a la calle.',
      'Respira despacio: cuenta 4 al coger aire y 6 al soltarlo. Repítelo diez veces.',
      'Escribe a tu persona de confianza. No hace falta explicar nada: «tengo ganas, distráeme».',
      'Haz algo con el cuerpo: camina, friega, date una ducha. Las manos ocupadas ayudan.',
      'Piensa en lo que pasa después de jugar, no en lo que imaginas antes. ¿Cómo te sentiste la última vez?',
    ],
    left: 'quedan',
    stop: 'Parar',
    doneTitle: 'Han pasado 15 minutos',
    doneQ: '¿Cómo están las ganas ahora?',
    lower: 'Han bajado',
    strong: 'Siguen fuertes',
    lowerMsg: (n: number) => `Bien hecho. Has dejado pasar ${n === 1 ? 'un impulso' : `${n} impulsos`} desde que empezaste. Cada vez cuesta un poco menos.`,
    strongMsg: 'Llama ahora a alguien. Si no tienes a nadie, la línea de FEJAR orienta gratis, y el 024 atiende a cualquier hora si lo estás pasando muy mal.',
    again: 'Otros 15 minutos',
    call: 'Llamar a FEJAR · 900 200 225',
    crisis: 'Crisis · 024',
  },
  en: {
    title: 'I want to gamble right now',
    intro: 'Urges rise, peak and fade if you do not act on them. You do not have to beat them forever: only for the next 15 minutes.',
    start: 'Start the 15 minutes',
    steps: [
      'Get away from your phone or the place where you were going to gamble. Change rooms or go outside.',
      'Breathe slowly: count 4 breathing in and 6 breathing out. Do it ten times.',
      'Message the person you trust. No need to explain: “I have the urge, distract me.”',
      'Do something physical: walk, do the dishes, take a shower. Busy hands help.',
      'Think about what happens after gambling, not what you imagine before. How did you feel last time?',
    ],
    left: 'left',
    stop: 'Stop',
    doneTitle: '15 minutes have passed',
    doneQ: 'How strong is the urge now?',
    lower: 'It has dropped',
    strong: 'Still strong',
    lowerMsg: (n: number) => `Well done. You have let ${n === 1 ? 'one urge' : `${n} urges`} pass since you started. It gets a little easier each time.`,
    strongMsg: 'Call someone now. If there is nobody, a gambling helpline can help for free, and crisis lines answer at any hour if you are struggling.',
    again: 'Another 15 minutes',
    call: 'UK helpline · 0808 8020 133',
    crisis: 'US helpline · 1-800-GAMBLER',
  },
};

export default function UrgeTimer({ lang }: { lang: Lang }) {
  const t = T[lang];
  const [left, setLeft] = useState<number | null>(null);
  const [outcome, setOutcome] = useState<'lower' | 'strong' | null>(null);
  const [beaten, setBeaten] = useState(0);
  const timer = useRef<number | null>(null);

  useEffect(() => () => {
    if (timer.current) window.clearInterval(timer.current);
  }, []);

  const start = () => {
    setOutcome(null);
    setLeft(TOTAL);
    const end = Date.now() + TOTAL * 1000;
    if (timer.current) window.clearInterval(timer.current);
    timer.current = window.setInterval(() => {
      const s = Math.max(0, Math.round((end - Date.now()) / 1000));
      setLeft(s);
      if (s === 0 && timer.current) window.clearInterval(timer.current);
    }, 1000);
  };
  const stop = () => {
    if (timer.current) window.clearInterval(timer.current);
    setLeft(null);
  };
  const lower = () => {
    const p = loadProgress();
    const urges = p.urges + 1;
    saveProgress({ ...p, urges });
    setBeaten(urges);
    setOutcome('lower');
  };

  const running = left !== null && left > 0;
  const done = left === 0;
  const elapsed = left === null ? 0 : TOTAL - left;
  const step = Math.min(t.steps.length - 1, Math.floor(elapsed / (TOTAL / t.steps.length)));
  const mm = left === null ? '15:00' : `${Math.floor(left / 60)}:${String(left % 60).padStart(2, '0')}`;
  const tel = lang === 'es' ? ['900200225', '024'] : ['08088020133', '18004262537'];

  return (
    <div className="cam-card urge">
      <p className="plan-title">{t.title}</p>
      {!running && !done && (
        <>
          <p>{t.intro}</p>
          <button type="button" className="btn" onClick={start}>
            {t.start}
          </button>
        </>
      )}
      {running && (
        <>
          <p className="urge-clock" aria-live="off">
            <span className="num">{mm}</span> <small>{t.left}</small>
          </p>
          <div className="urge-track" aria-hidden="true">
            <div className="urge-fill" style={{ width: `${(100 * elapsed) / TOTAL}%` }} />
          </div>
          <p className="urge-step" aria-live="polite">
            {t.steps[step]}
          </p>
          <button type="button" className="btn ghost small" onClick={stop}>
            {t.stop}
          </button>
        </>
      )}
      {done && (
        <>
          <p className="urge-step">
            <strong>{t.doneTitle}.</strong> {t.doneQ}
          </p>
          {outcome === null && (
            <div className="cam-actions">
              <button type="button" className="btn" onClick={lower}>
                {t.lower}
              </button>
              <button type="button" className="btn ghost" onClick={() => setOutcome('strong')}>
                {t.strong}
              </button>
            </div>
          )}
          {outcome === 'lower' && <p>{t.lowerMsg(beaten)}</p>}
          {outcome === 'strong' && (
            <>
              <p>{t.strongMsg}</p>
              <div className="cam-actions">
                <button type="button" className="btn ghost" onClick={start}>
                  {t.again}
                </button>
              </div>
            </>
          )}
        </>
      )}
      <p className="urge-phones">
        <a href={`tel:${tel[0]}`}>{t.call}</a> · <a href={`tel:${tel[1]}`}>{t.crisis}</a>
      </p>
    </div>
  );
}
