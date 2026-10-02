import { useState } from 'react';
import { fmt, type Lang } from '../../i18n';

const T = {
  es: {
    deposits: 'Lo que ingresas o te gastas en juego al mes',
    withdrawals: 'Lo que retiras o cobras en premios al mes',
    years: 'Años jugando así',
    wage: 'Lo que ganas por hora de trabajo (neto)',
    perMonth: 'Pierdes al mes',
    perYear: 'Al año',
    total: 'En total',
    hours: 'Horas de trabajo',
    ahead: (y: string) => `Si sigues igual, en 5 años más serán otros ${y}.`,
    win: 'Con estas cifras sales ganando. Si es así de verdad, compruébalo con el historial: la memoria suele quedarse con los premios.',
    how: 'Cómo sacar la cifra real',
    steps: [
      'Abre la app de tu banco y busca los movimientos con el nombre de cada casa de apuestas, casino o lotería. Suma lo que salió y lo que entró.',
      'En la web o app de cada operador suele haber un historial de depósitos y retiradas. Descárgalo si se puede.',
      'Cuenta también el efectivo: salones, bares, administraciones de lotería.',
      'Lo que perdiste es lo que ingresaste menos lo que retiraste. Los premios que volviste a jugar ya están dentro.',
    ],
    note: 'Nada de esto sale de tu navegador.',
  },
  en: {
    deposits: 'What you deposit or spend on gambling per month',
    withdrawals: 'What you withdraw or collect in prizes per month',
    years: 'Years gambling like this',
    wage: 'What you earn per hour of work (after tax)',
    perMonth: 'You lose per month',
    perYear: 'Per year',
    total: 'In total',
    hours: 'Hours of work',
    ahead: (y: string) => `If nothing changes, five more years will cost another ${y}.`,
    win: 'With these figures you come out ahead. If that is really so, check it against your history: memory tends to keep the wins.',
    how: 'How to get the real figure',
    steps: [
      'Open your banking app and search for transactions with the name of each bookmaker, casino or lottery. Add up what went out and what came in.',
      'Each operator’s website or app usually has a deposit and withdrawal history. Download it if you can.',
      'Count cash too: arcades, bars, lottery shops.',
      'What you lost is what you deposited minus what you withdrew. Prizes you played again are already included.',
    ],
    note: 'None of this leaves your browser.',
  },
};

export default function LossCalc({ lang }: { lang: Lang }) {
  const t = T[lang];
  const f = fmt(lang);
  const [dep, setDep] = useState(200);
  const [wd, setWd] = useState(50);
  const [years, setYears] = useState(3);
  const [wage, setWage] = useState(10);
  const month = dep - wd;
  const total = month * 12 * years;

  return (
    <div className="game loss-calc">
      <section className="panel wide-panel">
        <div className="sim-controls">
          <label className="field-inline">
            <span>{t.deposits}</span>
            <input type="number" min={0} step={10} value={dep} onChange={(e) => setDep(Math.max(0, Number(e.target.value)))} />
          </label>
          <label className="field-inline">
            <span>{t.withdrawals}</span>
            <input type="number" min={0} step={10} value={wd} onChange={(e) => setWd(Math.max(0, Number(e.target.value)))} />
          </label>
          <label className="field-inline grow">
            <span>
              {t.years}: <strong className="num">{years}</strong>
            </span>
            <input type="range" min={1} max={30} value={years} onChange={(e) => setYears(Number(e.target.value))} />
          </label>
          <label className="field-inline">
            <span>{t.wage}</span>
            <input type="number" min={1} step={1} value={wage} onChange={(e) => setWage(Math.max(0, Number(e.target.value)))} />
          </label>
        </div>

        {month > 0 ? (
          <>
            <dl className="scores four">
              <div>
                <dt>{t.perMonth}</dt>
                <dd className="loss">{f.eur(month)}</dd>
              </div>
              <div>
                <dt>{t.perYear}</dt>
                <dd className="loss">{f.eur(month * 12)}</dd>
              </div>
              <div>
                <dt>{t.total}</dt>
                <dd className="loss">{f.eur(total)}</dd>
              </div>
              <div>
                <dt>{t.hours}</dt>
                <dd>{wage > 0 ? f.int(total / wage) : '—'}</dd>
              </div>
            </dl>
            <p>{t.ahead(f.eur(month * 60))}</p>
          </>
        ) : (
          <p>{t.win}</p>
        )}

        <p className="panel-label">{t.how}</p>
        <ol>
          {t.steps.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ol>
        <p className="figure-foot">{t.note}</p>
      </section>
    </div>
  );
}
