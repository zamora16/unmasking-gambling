import { useMemo, useState } from 'react';
import { LOTTERIES, drawNumbers, type LotteryId } from '../../lib/lottery';
import { mulberry32 } from '../../lib/rng';
import { fmt, type Lang } from '../../i18n';
import { Dual } from '../../charts/core';

const T = {
  es: {
    names: { primitiva: 'La Primitiva', bonoloto: 'Bonoloto', euromillones: 'EuroMillones', nacional: 'Lotería Nacional (décimo)' } as Record<LotteryId, string>,
    game: 'Juego',
    odds: 'Probabilidad de ganar el premio mayor con una apuesta',
    oneIn: (x: string) => `1 entre ${x}`,
    years: (x: string) => `Si jugaras una apuesta en cada sorteo, de media tardarías ${x} años en ganarlo.`,
    cats: 'Todas las categorías',
    cat: 'Aciertos',
    prob: 'Probabilidad',
    sim: 'Juega toda una vida',
    simSub: 'Simulamos que juegas una apuesta en cada sorteo durante los años que elijas, con sorteos de verdad al azar.',
    yearsLabel: 'Años jugando',
    run: 'Simular',
    spent: 'Habrías gastado',
    back: 'De eso, vuelve de media en premios',
    jackpots: 'Veces que ganas el premio mayor',
    draws: 'Sorteos jugados',
    hits: 'Tus aciertos',
    none: 'ninguna',
    price: (p: string, d: number) => `${p} por apuesta · ${d} sorteos a la semana`,
    note: 'La simulación cuenta cuántas veces aciertas cada categoría. El dinero devuelto es la media que marca el reglamento, porque los premios reales dependen de cuánta gente acierte en cada sorteo.',
  },
  en: {
    names: { primitiva: 'La Primitiva', bonoloto: 'Bonoloto', euromillones: 'EuroMillions', nacional: 'Spanish National Lottery (tenth)' } as Record<LotteryId, string>,
    game: 'Game',
    odds: 'Chance of winning the top prize with one ticket',
    oneIn: (x: string) => `1 in ${x}`,
    years: (x: string) => `Playing one ticket in every draw, it would take you ${x} years on average to win it.`,
    cats: 'All prize tiers',
    cat: 'Matches',
    prob: 'Probability',
    sim: 'Play for a lifetime',
    simSub: 'We simulate you playing one ticket in every draw for as many years as you choose, with real random draws.',
    yearsLabel: 'Years playing',
    run: 'Simulate',
    spent: 'You would have spent',
    back: 'Of which, paid back in prizes on average',
    jackpots: 'Times you win the top prize',
    draws: 'Draws played',
    hits: 'Your matches',
    none: 'none',
    price: (p: string, d: number) => `${p} per ticket · ${d} draws a week`,
    note: 'The simulation counts how often you hit each tier. The money paid back is the average set by the rules, since real prizes depend on how many people win in each draw.',
  },
};

export default function Lottery({ lang }: { lang: Lang }) {
  const t = T[lang];
  const f = fmt(lang);
  const [id, setId] = useState<LotteryId>('primitiva');
  const [years, setYears] = useState(40);
  const [seed, setSeed] = useState(1);
  const L = LOTTERIES[id];
  const cats = L.categories();
  const pJ = L.jackpot();
  const drawsYear = L.drawsPerWeek * 52;

  const sim = useMemo(() => {
    const rand = mulberry32(seed * 7919 + years);
    const draws = drawsYear * years;
    const counts: Record<string, number> = {};
    for (const c of cats) counts[c.key] = 0;
    if (id === 'nacional') {
      for (let i = 0; i < draws; i++) if (Math.floor(rand() * 100000) === 12345) counts['1º']++;
    } else if (id === 'euromillones') {
      const mine = drawNumbers(50, 5, rand);
      const stars = drawNumbers(12, 2, rand);
      for (let i = 0; i < draws; i++) {
        const d = drawNumbers(50, 5, rand);
        const s = drawNumbers(12, 2, rand);
        const k = d.filter((x) => mine.includes(x)).length;
        const j = s.filter((x) => stars.includes(x)).length;
        const key = `${k}+${j}`;
        if (key in counts) counts[key]++;
      }
    } else {
      const mine = drawNumbers(49, 6, rand);
      for (let i = 0; i < draws; i++) {
        const d = drawNumbers(49, 7, rand); // 6 winning numbers + complementario
        const main = d.slice(0, 6);
        const k = main.filter((x) => mine.includes(x)).length;
        if (k === 6) counts['6']++;
        else if (k === 5) counts[mine.includes(d[6]) ? '5+C' : '5']++;
        else if (k === 4) counts['4']++;
        else if (k === 3) counts['3']++;
      }
    }
    return { draws, counts, spent: draws * L.price };
  }, [id, years, seed]);

  return (
    <div className="game lottery">
      <div className="panel">
        <label className="field-inline">
          <span>{t.game}</span>
          <select value={id} onChange={(e) => setId(e.target.value as LotteryId)}>
            {(Object.keys(t.names) as LotteryId[]).map((k) => (
              <option key={k} value={k}>
                {t.names[k]}
              </option>
            ))}
          </select>
        </label>
        <p className="figure-sub">{t.price(f.eur(L.price, 2), L.drawsPerWeek)}</p>
        <p className="panel-label">{t.odds}</p>
        <p className="big-odds">{t.oneIn(f.int(Math.round(1 / pJ)))}</p>
        <p>{t.years(f.int(Math.round(1 / pJ / drawsYear)))}</p>
        {cats.length > 1 && (
          <details className="cats">
            <summary>{t.cats}</summary>
            <table className="paytable">
              <thead>
                <tr>
                  <th scope="col">{t.cat}</th>
                  <th scope="col">{t.prob}</th>
                </tr>
              </thead>
              <tbody>
                {cats.map((c) => (
                  <tr key={c.key}>
                    <th scope="row">{c.key}</th>
                    <td className="num">
                      <Dual simple={t.oneIn(f.int(Math.round(1 / c.p)))} tech={c.p.toExponential(3)} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </details>
        )}
      </div>

      <div className="panel">
        <p className="panel-label">{t.sim}</p>
        <p className="figure-sub">{t.simSub}</p>
        <div className="sim-controls">
          <label className="field-inline grow">
            <span>
              {t.yearsLabel}: <strong className="num">{years}</strong>
            </span>
            <input type="range" min={1} max={70} value={years} onChange={(e) => setYears(Number(e.target.value))} />
          </label>
          <button type="button" className="btn" onClick={() => setSeed((s) => s + 1)}>
            ↻ {t.run}
          </button>
        </div>
        <dl className="scores">
          <div>
            <dt>{t.draws}</dt>
            <dd>{f.int(sim.draws)}</dd>
          </div>
          <div>
            <dt>{t.spent}</dt>
            <dd className="loss">{f.eur(sim.spent)}</dd>
          </div>
          <div>
            <dt>{t.back}</dt>
            <dd>{f.eur(sim.spent * L.payout)}</dd>
          </div>
          <div>
            <dt>{t.jackpots}</dt>
            <dd>{f.int(sim.counts[cats[0].key])}</dd>
          </div>
        </dl>
        {cats.length > 1 && (
          <>
            <p className="panel-label">{t.hits}</p>
            <ul className="hits">
              {cats.map((c) => (
                <li key={c.key}>
                  <span className="hit-key">{c.key}</span>
                  <span className="num">{sim.counts[c.key] ? f.int(sim.counts[c.key]) : t.none}</span>
                </li>
              ))}
            </ul>
          </>
        )}
        <p className="figure-foot">{t.note}</p>
      </div>
    </div>
  );
}
