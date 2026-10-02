import { useMemo, useState } from 'react';
import { aheadEvenBehind } from '../../lib/binomial';
import { fmt, type Lang } from '../../i18n';
import LineChart from '../../charts/LineChart';
import { Dual } from '../../charts/core';

/** Bets on the wheel: how many numbers they cover and what they pay. */
const BETS = [
  { key: 'red', covers: 18, toOne: 1, color: 'var(--series-1)' },
  { key: 'dozen', covers: 12, toOne: 2, color: 'var(--series-2)' },
  { key: 'number', covers: 1, toOne: 35, color: 'var(--series-3)' },
] as const;
const MILESTONES = [10, 100, 1000, 10000, 100000];
// Log-spaced spin counts for the curve, nudged to counts where no bet can
// end exactly even (odd, not a multiple of 3): ties at even n make the
// raw curve zigzag. The table keeps round numbers and counts ties as not ahead.
const noTie = (n: number) => {
  while (n % 2 === 0 || n % 3 === 0) n++;
  return n;
};
const GRID = [...new Set(Array.from({ length: 41 }, (_, i) => noTie(Math.round(10 ** (i / 8)))))];

const T = {
  es: {
    bets: { red: 'Al rojo (paga 1 a 1)', dozen: 'A una docena (2 a 1)', number: 'A un número (35 a 1)' },
    wheel: 'Ruleta',
    euro: 'Europea',
    amer: 'Americana',
    stake: 'Apuesta por tirada',
    chart: 'Qué parte de los jugadores va ganando después de cada número de tiradas',
    spins: 'Tiradas',
    ahead: 'van ganando',
    colN: 'Tiradas',
    colLoss: 'Pérdida media',
    hours: (h: string) => `≈ ${h} h`,
    simple:
      'Apostar a un número da más sorpresas: mucha gente va ganando durante más tiempo, porque un solo acierto paga 35 veces. Pero la pérdida media es la misma en todas las apuestas. El tiempo juega siempre a favor de la casa.',
  },
  en: {
    bets: { red: 'On red (pays 1 to 1)', dozen: 'On a dozen (2 to 1)', number: 'On one number (35 to 1)' },
    wheel: 'Wheel',
    euro: 'European',
    amer: 'American',
    stake: 'Bet per spin',
    chart: 'Share of players who are ahead after each number of spins',
    spins: 'Spins',
    ahead: 'ahead',
    colN: 'Spins',
    colLoss: 'Average loss',
    hours: (h: string) => `≈ ${h} h`,
    simple:
      'Betting on one number brings more surprises: many people stay ahead for longer, because a single hit pays 35 times. But the average loss is the same on every bet. Time is always on the house’s side.',
  },
};

export default function AheadOverTime({ lang }: { lang: Lang }) {
  const t = T[lang];
  const f = fmt(lang);
  const [american, setAmerican] = useState(false);
  const [stake, setStake] = useState(5);
  const slots = american ? 38 : 37;
  const edge = 1 - 36 / slots;

  const curves = useMemo(
    () => BETS.map((b) => ({ ...b, pts: GRID.map((n) => ({ x: Math.log10(n), y: aheadEvenBehind(n, b.covers / slots, b.toOne).ahead })) })),
    [slots],
  );
  const table = useMemo(() => MILESTONES.map((n) => ({ n, cells: BETS.map((b) => aheadEvenBehind(n, b.covers / slots, b.toOne).ahead) })), [slots]);
  const share = (v: number) => (v > 0 && v < 0.001 ? `< ${f.pct(0.001, 1)}` : f.pct(v, 1));

  return (
    <div className="game ahead">
      <section className="panel wide-panel">
        <div className="sim-controls">
          <div className="field-inline">
            <span>{t.wheel}</span>
            <div className="seg-group" role="radiogroup" aria-label={t.wheel}>
              <button type="button" role="radio" aria-checked={!american} className={`seg-btn${!american ? ' on' : ''}`} onClick={() => setAmerican(false)}>
                {t.euro}
              </button>
              <button type="button" role="radio" aria-checked={american} className={`seg-btn${american ? ' on' : ''}`} onClick={() => setAmerican(true)}>
                {t.amer}
              </button>
            </div>
          </div>
          <label className="field-inline">
            <span>{t.stake}</span>
            <input type="number" min={1} step={1} value={stake} onChange={(e) => setStake(Math.max(0, Number(e.target.value)))} />
          </label>
        </div>

        <p className="panel-label">{t.chart}</p>
        <LineChart
          series={curves.map((c) => ({ key: c.key, label: t.bets[c.key], color: c.color, points: c.pts }))}
          height={280}
          yDomain={[0, 0.6]}
          xTicks={[1, 10, 100, 1000, 10000, 100000].map((n) => ({ value: Math.log10(n), label: f.int(n) }))}
          xFormat={(x) => f.int(10 ** x)}
          yFormat={(y) => f.pct(y, 0)}
          tooltipX={(x) => `${t.spins}: ${f.int(Math.round(10 ** x))}`}
          tooltipY={(y) => `${f.pct(y, 1)} ${t.ahead}`}
          ariaLabel={t.chart}
        />

        <div className="ug-table-scroll">
          <table className="paytable compare">
            <thead>
              <tr>
                <th scope="col">{t.colN}</th>
                {BETS.map((b) => (
                  <th key={b.key} scope="col">
                    {t.bets[b.key]}
                  </th>
                ))}
                <th scope="col">{t.colLoss}</th>
              </tr>
            </thead>
            <tbody>
              {table.map((r) => (
                <tr key={r.n}>
                  <th scope="row">
                    {f.int(r.n)} <small className="muted">{t.hours(f.num(r.n / 35, r.n / 35 < 10 ? 1 : 0))}</small>
                  </th>
                  {r.cells.map((c, i) => (
                    <td key={i} className="num">
                      {share(c)}
                    </td>
                  ))}
                  <td className="num loss">−{f.eur(r.n * stake * edge)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="figure-foot">
          <Dual
            simple={t.simple}
            tech={`P(${lang === 'es' ? 'ir ganando' : 'ahead'}) = P(W·(k+1) > n), W ~ Bin(n, c/${slots}), ${lang === 'es' ? 'calculada exactamente; la curva usa números de tiradas sin empate posible y la tabla cuenta los empates como no ir ganando' : 'computed exactly; the curve uses spin counts where a tie is impossible, and the table counts ties as not ahead'}. ${lang === 'es' ? 'Ventaja de la casa' : 'House edge'}: 1 − 36/${slots} = ${f.pct(edge, 2)}. ${lang === 'es' ? 'Horas a unas 35 tiradas por hora en mesa física.' : 'Hours at about 35 spins an hour at a live table.'}`}
          />
        </p>
      </section>
    </div>
  );
}
