import { useMemo, useState } from 'react';
import { simulateTipsters } from '../../lib/tipsters';
import { fmt, type Lang } from '../../i18n';
import { Dual } from '../../charts/core';

const COUNT = 1000;
const ODDS = 1.9;
const TOP = 10;

const T = {
  es: {
    picks: 'Pronósticos por temporada',
    another: 'Otros mil tipsters',
    title: (n: string) => `Los 10 mejores de ${n} tipsters que eligen al azar`,
    colRank: 'Puesto',
    colS1: 'Temporada 1',
    colS2: 'Temporada 2',
    colHits: 'Aciertos',
    avgTop: 'Media de los 10 mejores',
    avgAll: 'Media de todos',
    profitable: 'Acaban la temporada 1 en positivo',
    simple: (s1: string, s2: string) =>
      `Ninguno de estos tipsters sabe nada: cada pronóstico es como lanzar una moneda a cuota 1,90. Aun así, los diez mejores de la primera temporada parecen expertos, con un rendimiento medio de ${s1}. La temporada siguiente, esos mismos diez se quedan en ${s2}: la comisión de la casa. Lo que se anuncia es la temporada 1.`,
    tech: (p: string, ev: string) =>
      `Cada pronóstico gana con p = ${p} a cuota 1,90 (mercado de dos resultados con un 5,3 % de margen), así que el ROI esperado es ${ev} para todos. Ordenar por la temporada 1 selecciona la cola derecha del ruido; la temporada 2 es independiente y vuelve a la media: regresión a la media.`,
  },
  en: {
    picks: 'Tips per season',
    another: 'Another thousand tipsters',
    title: (n: string) => `The top 10 of ${n} tipsters who pick at random`,
    colRank: 'Rank',
    colS1: 'Season 1',
    colS2: 'Season 2',
    colHits: 'Hits',
    avgTop: 'Average of the top 10',
    avgAll: 'Average of everyone',
    profitable: 'End season 1 in profit',
    simple: (s1: string, s2: string) =>
      `None of these tipsters knows anything: every tip is a coin toss at odds of 1.90. Even so, the top ten of season one look like experts, with an average return of ${s1}. The next season, those same ten get ${s2}: the bookmaker’s fee. What gets advertised is season one.`,
    tech: (p: string, ev: string) =>
      `Every tip wins with p = ${p} at odds of 1.90 (a two-way market with a 5.3% margin), so the expected ROI is ${ev} for everyone. Ranking on season one selects the right tail of the noise; season two is independent and falls back to the mean: regression to the mean.`,
  },
};

export default function TipsterSim({ lang }: { lang: Lang }) {
  const t = T[lang];
  const f = fmt(lang);
  const [picks, setPicks] = useState(100);
  const [seed, setSeed] = useState(1);
  const all = useMemo(() => simulateTipsters(COUNT, picks, ODDS, 0.5, seed), [picks, seed]);
  const top = all.slice(0, TOP);
  const mean = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
  const top1 = mean(top.map((x) => x.roi1));
  const top2 = mean(top.map((x) => x.roi2));
  const allMean = mean(all.map((x) => x.roi1));
  const inProfit = all.filter((x) => x.roi1 > 0).length / COUNT;

  return (
    <div className="game tipsters">
      <section className="panel wide-panel">
        <div className="sim-controls">
          <label className="field-inline grow">
            <span>
              {t.picks}: <strong className="num">{picks}</strong>
            </span>
            <input type="range" min={20} max={1000} step={10} value={picks} onChange={(e) => setPicks(Number(e.target.value))} />
          </label>
          <button type="button" className="btn ghost small" onClick={() => setSeed((s) => s + 1)}>
            ↻ {t.another}
          </button>
        </div>
        <p className="panel-label">{t.title(f.int(COUNT))}</p>
        <div className="ug-table-scroll full">
          <table className="paytable compare">
            <thead>
              <tr>
                <th scope="col">{t.colRank}</th>
                <th scope="col">{t.colHits}</th>
                <th scope="col">{t.colS1}</th>
                <th scope="col">{t.colS2}</th>
              </tr>
            </thead>
            <tbody>
              {top.map((x, i) => (
                <tr key={x.id}>
                  <th scope="row">{i + 1}</th>
                  <td className="num">
                    {x.wins1}/{picks}
                  </td>
                  <td className="num win">{f.signedPct(x.roi1, 1)}</td>
                  <td className={`num ${x.roi2 < 0 ? 'loss' : 'win'}`}>{f.signedPct(x.roi2, 1)}</td>
                </tr>
              ))}
              <tr className="on">
                <th scope="row">{t.avgTop}</th>
                <td />
                <td className="num">{f.signedPct(top1, 1)}</td>
                <td className="num">{f.signedPct(top2, 1)}</td>
              </tr>
            </tbody>
          </table>
        </div>
        <dl className="scores three">
          <div>
            <dt>{t.profitable}</dt>
            <dd>{f.pct(inProfit, 0)}</dd>
          </div>
          <div>
            <dt>{t.avgAll}</dt>
            <dd className="loss">{f.signedPct(allMean, 1)}</dd>
          </div>
          <div>
            <dt>
              {t.avgTop} · {t.colS2}
            </dt>
            <dd className={top2 < 0 ? 'loss' : 'win'}>{f.signedPct(top2, 1)}</dd>
          </div>
        </dl>
        <p className="figure-foot">
          <Dual simple={t.simple(f.signedPct(top1, 1), f.signedPct(top2, 1))} tech={t.tech(f.num(0.5, 1), f.signedPct(0.5 * ODDS - 1, 1))} />
        </p>
      </section>
    </div>
  );
}
