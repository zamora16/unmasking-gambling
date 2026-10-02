import { useMemo, useState } from 'react';
import { STRIP, spinReel, payout, exactRTP } from '../../lib/slot';
import { mulberry32 } from '../../lib/rng';
import { fmt, type Lang } from '../../i18n';
import { Dual } from '../../charts/core';

const SPINS = 200_000;
/** Buckets of "spins since the last prize". */
const BUCKETS = [
  [0, 0],
  [1, 2],
  [3, 5],
  [6, 9],
  [10, 14],
  [15, Infinity],
] as const;

/** Spin the site's slot and record, for each spin, how long the drought before it was. */
export function droughtStats(spins: number, seed: number) {
  const rand = mulberry32(seed);
  const n = BUCKETS.map(() => 0);
  const hits = BUCKETS.map(() => 0);
  let since = 0;
  let longest = 0;
  for (let i = 0; i < spins; i++) {
    const b = BUCKETS.findIndex(([lo, hi]) => since >= lo && since <= hi);
    const win = payout([0, 1, 2].map((r) => STRIP[spinReel(r, rand())])) > 0;
    n[b]++;
    if (win) {
      hits[b]++;
      since = 0;
    } else {
      since++;
      if (since > longest) longest = since;
    }
  }
  return { rows: BUCKETS.map((bk, i) => ({ bk, n: n[i], rate: n[i] ? hits[i] / n[i] : 0 })), longest };
}

const T = {
  es: {
    title: (n: string) => `${n} tiradas en la tragaperras de esta web`,
    another: 'Otra tanda',
    colDrought: 'Tiradas seguidas sin premio',
    colN: 'Veces',
    colRate: 'Premio en la siguiente',
    bucket: (lo: number, hi: number) => (lo === hi ? (lo === 0 ? 'Recién ha pagado' : `${lo}`) : hi === Infinity ? `${lo} o más` : `${lo} a ${hi}`),
    exact: 'Probabilidad exacta de premio en cualquier tirada',
    longest: 'Racha más larga sin premio',
    simple: 'Da igual cuánto lleve la máquina sin pagar: la probabilidad de premio en la siguiente tirada es la misma. Las pequeñas diferencias entre filas son ruido del azar, y cambian en cada tanda.',
    tech: 'Cada tirada usa números aleatorios nuevos e independientes, así que P(premio | k tiradas sin premio) = P(premio) para todo k. Las tasas por fila son estimaciones con su propio error de muestreo, mayor en las filas con menos casos.',
  },
  en: {
    title: (n: string) => `${n} spins on this site’s slot machine`,
    another: 'Another batch',
    colDrought: 'Spins in a row without a prize',
    colN: 'Times',
    colRate: 'Prize on the next spin',
    bucket: (lo: number, hi: number) => (lo === hi ? (lo === 0 ? 'Just paid' : `${lo}`) : hi === Infinity ? `${lo} or more` : `${lo} to ${hi}`),
    exact: 'Exact chance of a prize on any spin',
    longest: 'Longest run without a prize',
    simple: 'However long the machine has gone without paying, the chance of a prize on the next spin is the same. The small differences between rows are random noise, and they change with every batch.',
    tech: 'Every spin uses fresh, independent random numbers, so P(prize | k spins without one) = P(prize) for every k. The per-row rates are estimates with their own sampling error, larger in rows with fewer cases.',
  },
};

export default function SlotDrought({ lang }: { lang: Lang }) {
  const t = T[lang];
  const f = fmt(lang);
  const [seed, setSeed] = useState(1);
  const { rows, longest } = useMemo(() => droughtStats(SPINS, seed), [seed]);
  const { hitRate } = exactRTP();

  return (
    <div className="game drought">
      <section className="panel wide-panel">
        <div className="sim-controls">
          <p className="panel-label grow">{t.title(f.int(SPINS))}</p>
          <button type="button" className="btn ghost small" onClick={() => setSeed((s) => s + 1)}>
            ↻ {t.another}
          </button>
        </div>
        <div className="ug-table-scroll full">
          <table className="paytable compare">
            <thead>
              <tr>
                <th scope="col">{t.colDrought}</th>
                <th scope="col">{t.colN}</th>
                <th scope="col">{t.colRate}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.bk[0]}>
                  <th scope="row">{t.bucket(r.bk[0], r.bk[1])}</th>
                  <td className="num">{f.int(r.n)}</td>
                  <td className="num">{r.n ? f.pct(r.rate, 1) : '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <dl className="scores">
          <div>
            <dt>{t.exact}</dt>
            <dd>{f.pct(hitRate, 1)}</dd>
          </div>
          <div>
            <dt>{t.longest}</dt>
            <dd>{f.int(longest)}</dd>
          </div>
        </dl>
        <p className="figure-foot">
          <Dual simple={t.simple} tech={t.tech} />
        </p>
      </section>
    </div>
  );
}
