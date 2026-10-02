import { useState } from 'react';
import { fmt, type Lang } from '../../i18n';
import { Dual } from '../../charts/core';

/**
 * Two numbers every bettor should know: how often you must win at a given
 * price just to break even, and how many bets it takes before your record
 * says anything about skill rather than luck.
 */
export function betsToProve(odds: number, edge: number, z = 1.96): number {
  // a bettor with true ROI `edge` at decimal odds `odds` wins with p = (1 + edge) / odds
  const p = Math.min(0.999, (1 + edge) / odds);
  const sd = odds * Math.sqrt(p * (1 - p)); // sd of the return of one unit bet
  return Math.ceil(((z * sd) / edge) ** 2);
}

const T = {
  es: {
    odds: 'Cuota media a la que apuestas',
    margin: 'Comisión de la casa',
    edge: 'Ventaja que crees tener',
    need: 'Tienes que acertar',
    needNote: 'solo para no perder',
    fair: 'Probabilidad real del resultado',
    fairNote: 'sin la comisión',
    bets: 'Apuestas para demostrar que no es suerte',
    years: (y: string) => `≈ ${y} años a 10 apuestas por semana`,
    simple: (n: string) =>
      `Aunque de verdad fueras mejor que la casa, harían falta unas ${n} apuestas para que tus resultados lo demostraran. Antes de eso, una buena racha y la habilidad se ven igual. Por eso tantas personas creen tener un método: el azar fabrica rachas de sobra.`,
    tech: (p: string, sd: string) =>
      `Con ROI real r y cuota o, p = (1 + r)/o y la desviación típica del retorno por apuesta es o·√(p(1−p)) = ${sd}. Para que el intervalo del 95 % del ROI medio excluya el cero, n ≥ (1,96·σ/r)². Punto de equilibrio: 1/o = ${p}.`,
  },
  en: {
    odds: 'Average odds you bet at',
    margin: 'Bookmaker fee',
    edge: 'Edge you think you have',
    need: 'You must win',
    needNote: 'just to break even',
    fair: 'True chance of the result',
    fairNote: 'without the fee',
    bets: 'Bets to show it is not luck',
    years: (y: string) => `≈ ${y} years at 10 bets a week`,
    simple: (n: string) =>
      `Even if you really were better than the bookmaker, it would take about ${n} bets before your results proved it. Until then, a good run and real skill look the same. That is why so many people believe they have a method: chance produces runs in plenty.`,
    tech: (p: string, sd: string) =>
      `With true ROI r and odds o, p = (1 + r)/o and the standard deviation of the return per bet is o·√(p(1−p)) = ${sd}. For the 95% interval of the mean ROI to exclude zero, n ≥ (1.96·σ/r)². Break-even: 1/o = ${p}.`,
  },
};

export default function BettingEdge({ lang }: { lang: Lang }) {
  const t = T[lang];
  const f = fmt(lang);
  const [odds, setOdds] = useState(2);
  const [margin, setMargin] = useState(6.5);
  const [edge, setEdge] = useState(3);
  const breakEven = 1 / odds;
  const fair = breakEven / (1 + margin / 100);
  const n = betsToProve(odds, edge / 100);
  const p = Math.min(0.999, (1 + edge / 100) / odds);
  const sd = odds * Math.sqrt(p * (1 - p));

  return (
    <div className="game betting-edge">
      <section className="panel wide-panel">
        <div className="sim-controls">
          <label className="field-inline grow">
            <span>
              {t.odds}: <strong className="num">{f.num(odds, 2)}</strong>
            </span>
            <input type="range" min={1.2} max={6} step={0.05} value={odds} onChange={(e) => setOdds(Number(e.target.value))} />
          </label>
          <label className="field-inline grow">
            <span>
              {t.margin}: <strong className="num">{f.num(margin, 1)} %</strong>
            </span>
            <input type="range" min={1} max={15} step={0.5} value={margin} onChange={(e) => setMargin(Number(e.target.value))} />
          </label>
          <label className="field-inline grow">
            <span>
              {t.edge}: <strong className="num">{f.num(edge, 1)} %</strong>
            </span>
            <input type="range" min={0.5} max={10} step={0.5} value={edge} onChange={(e) => setEdge(Number(e.target.value))} />
          </label>
        </div>

        <dl className="scores three">
          <div>
            <dt>
              {t.need} <small>· {t.needNote}</small>
            </dt>
            <dd>{f.pct(breakEven, 1)}</dd>
          </div>
          <div>
            <dt>
              {t.fair} <small>· {t.fairNote}</small>
            </dt>
            <dd className="loss">{f.pct(fair, 1)}</dd>
          </div>
          <div>
            <dt>{t.bets}</dt>
            <dd>
              {f.int(n)} <small>· {t.years(f.num(n / 520, 1))}</small>
            </dd>
          </div>
        </dl>
        <p className="figure-foot">
          <Dual simple={t.simple(f.int(n))} tech={t.tech(f.pct(breakEven, 1), f.num(sd, 3))} />
        </p>
      </section>
    </div>
  );
}
