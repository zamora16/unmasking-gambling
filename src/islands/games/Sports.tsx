import { useMemo, useState } from 'react';
import { decimalToAmerican, decimalToFractional, americanToDecimal, accumulator, longestLosingStreaks } from '../../lib/sports';
import { mulberry32 } from '../../lib/rng';
import { fmt, type Lang } from '../../i18n';
import Columns from '../../charts/Columns';
import { Dual } from '../../charts/core';
import summary from '../../data/odds/summary.json';

const MARGIN = summary.medianMargin;

const T = {
  es: {
    conv: 'Conversor de cuotas',
    convSub: 'La misma cuota se escribe de formas distintas según el país. Todas dicen lo mismo: cuánto te pagan y qué probabilidad da la casa.',
    decimal: 'Decimal (Europa)',
    fractional: 'Fraccionaria (Reino Unido)',
    american: 'Americana (EE. UU.)',
    implied: 'Probabilidad que da la casa',
    pays: (x: string) => `Por cada 10 € apostados te devuelven ${x} si aciertas.`,
    acca: 'Calculadora de combinadas',
    accaSub: 'En una combinada tienes que acertar todo. Las cuotas se multiplican y parece que ganas mucho… pero la comisión de la casa también se multiplica.',
    leg: (i: number) => `Partido ${i}`,
    add: '+ Añadir partido',
    remove: 'Quitar',
    combined: 'Cuota combinada',
    chance: 'Probabilidad real de acertarla',
    keeps: 'Se queda la casa de cada 100 €',
    single: (x: string) => `En una apuesta simple, ${x}.`,
    streak: 'Rachas perdedoras',
    streakSub: 'Incluso acertando bastante, las rachas largas de derrotas son normales. Así es la racha más larga en una temporada de apuestas.',
    bets: 'Apuestas en la temporada',
    win: 'Porcentaje de aciertos',
    seasons: 'temporadas simuladas',
    typical: (x: number) => `Lo más habitual: una racha de ${x} derrotas seguidas.`,
    worst: (p: string, x: number) => `En el ${p} de las temporadas hay una racha de ${x} o más.`,
    chase: 'Quien intenta «recuperar» durante esas rachas apostando más suele acabar perdiendo mucho más.',
    streakAxis: 'Racha más larga',
  },
  en: {
    conv: 'Odds converter',
    convSub: 'The same odds are written differently depending on the country. They all say the same thing: how much you get paid and what chance the bookmaker gives.',
    decimal: 'Decimal (Europe)',
    fractional: 'Fractional (UK)',
    american: 'American (US)',
    implied: 'Chance the bookmaker gives',
    pays: (x: string) => `For every €10 staked you get ${x} back if you win.`,
    acca: 'Accumulator calculator',
    accaSub: 'In an accumulator you have to get every pick right. The odds multiply and it looks like you can win a lot… but the bookmaker’s fee multiplies too.',
    leg: (i: number) => `Match ${i}`,
    add: '+ Add a match',
    remove: 'Remove',
    combined: 'Combined odds',
    chance: 'Real chance of winning it',
    keeps: 'Bookmaker keeps from every €100',
    single: (x: string) => `On a single bet, ${x}.`,
    streak: 'Losing streaks',
    streakSub: 'Even when you win quite often, long losing streaks are normal. This is the longest one in a season of bets.',
    bets: 'Bets in the season',
    win: 'Win rate',
    seasons: 'simulated seasons',
    typical: (x: number) => `Most common: a streak of ${x} losses in a row.`,
    worst: (p: string, x: number) => `In ${p} of seasons there is a streak of ${x} or more.`,
    chase: 'People who try to “win it back” during those streaks by betting more usually end up losing far more.',
    streakAxis: 'Longest streak',
  },
};

export default function Sports({ lang }: { lang: Lang }) {
  const t = T[lang];
  const f = fmt(lang);
  const [dec, setDec] = useState(2.5);
  const [legs, setLegs] = useState([1.8, 2.1, 1.65]);
  const [n, setN] = useState(100);
  const [pWin, setPWin] = useState(0.5);

  const acc = accumulator(legs, MARGIN);
  const singleEdge = MARGIN / (1 + MARGIN);

  const streaks = useMemo(() => {
    const s = longestLosingStreaks(n, pWin, 5000, mulberry32(n * 1000 + Math.round(pWin * 100)));
    const max = Math.max(...s);
    const counts = Array.from({ length: max + 1 }, (_, i) => s.filter((x) => x === i).length);
    const mode = counts.indexOf(Math.max(...counts));
    const sorted = [...s].sort((a, b) => a - b);
    const p90 = sorted[Math.floor(sorted.length * 0.9)];
    const shareP90 = s.filter((x) => x >= p90).length / s.length;
    return { counts, mode, p90, shareP90 };
  }, [n, pWin]);

  return (
    <div className="game sports">
      <section className="panel">
        <p className="panel-label">{t.conv}</p>
        <p className="figure-sub">{t.convSub}</p>
        <div className="conv">
          <label>
            <span>{t.decimal}</span>
            <input type="number" min={1.01} step={0.05} value={dec} onChange={(e) => setDec(Math.max(1.01, Number(e.target.value)))} />
          </label>
          <label>
            <span>{t.fractional}</span>
            <output className="num">{decimalToFractional(dec)}</output>
          </label>
          <label>
            <span>{t.american}</span>
            <input
              type="number"
              step={5}
              value={decimalToAmerican(dec)}
              onChange={(e) => {
                const a = Number(e.target.value);
                if (Math.abs(a) >= 100) setDec(Math.round(americanToDecimal(a) * 100) / 100);
              }}
            />
          </label>
          <label>
            <span>{t.implied}</span>
            <output className="num">{f.pct(1 / dec, 1)}</output>
          </label>
        </div>
        <p className="figure-foot">{t.pays(f.eur(10 * dec, 2))}</p>
      </section>

      <section className="panel">
        <p className="panel-label">{t.acca}</p>
        <p className="figure-sub">{t.accaSub}</p>
        <ul className="legs">
          {legs.map((o, i) => (
            <li key={i}>
              <span>{t.leg(i + 1)}</span>
              <input type="number" min={1.01} step={0.05} value={o} onChange={(e) => setLegs(legs.map((x, j) => (j === i ? Math.max(1.01, Number(e.target.value)) : x)))} aria-label={t.leg(i + 1)} />
              {legs.length > 1 && (
                <button type="button" className="link" onClick={() => setLegs(legs.filter((_, j) => j !== i))}>
                  {t.remove}
                </button>
              )}
            </li>
          ))}
        </ul>
        {legs.length < 10 && (
          <button type="button" className="btn ghost small" onClick={() => setLegs([...legs, 1.9])}>
            {t.add}
          </button>
        )}
        <dl className="scores">
          <div>
            <dt>{t.combined}</dt>
            <dd>{f.num(acc.odds, 2)}</dd>
          </div>
          <div>
            <dt>{t.chance}</dt>
            <dd>{f.pct(acc.pTrue, 1)}</dd>
          </div>
          <div>
            <dt>
              <Dual simple={t.keeps} tech={`${t.keeps} · 1 − (1+m)^−k`} />
            </dt>
            <dd className="loss">{f.eur(acc.effectiveEdge * 100, 2)}</dd>
          </div>
        </dl>
        <p className="figure-foot">{t.single(f.eur(singleEdge * 100, 2))}</p>
      </section>

      <section className="panel wide-panel">
        <p className="panel-label">{t.streak}</p>
        <p className="figure-sub">{t.streakSub}</p>
        <div className="sim-controls">
          <label className="field-inline grow">
            <span>
              {t.bets}: <strong className="num">{n}</strong>
            </span>
            <input type="range" min={20} max={500} step={10} value={n} onChange={(e) => setN(Number(e.target.value))} />
          </label>
          <label className="field-inline grow">
            <span>
              {t.win}: <strong className="num">{f.pct(pWin, 0)}</strong>
            </span>
            <input type="range" min={0.2} max={0.8} step={0.05} value={pWin} onChange={(e) => setPWin(Number(e.target.value))} />
          </label>
        </div>
        <Columns
          data={streaks.counts.map((c, i) => ({ label: String(i), values: { n: c } }))}
          series={[{ key: 'n', label: t.seasons, color: 'var(--series-1)' }]}
          height={220}
          format={(v) => `${f.int(v)} ${t.seasons}`}
          tickFormat={(v) => f.int(v)}
          xLabelEvery={Math.max(1, Math.ceil(streaks.counts.length / 14))}
          highlight={(_, i) => i === streaks.mode}
          ariaLabel={t.streakAxis}
        />
        <p className="figure-foot">
          {t.streakAxis} → · {t.typical(streaks.mode)} {t.worst(f.pct(streaks.shareP90, 0), streaks.p90)} {t.chase}
        </p>
      </section>
    </div>
  );
}
