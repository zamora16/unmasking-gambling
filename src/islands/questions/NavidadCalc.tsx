import { useMemo, useState } from 'react';
import { PROGRAMME, NAVIDAD, NUMBERS, PRICE, afterTax, chanceOfGordo, simulateLives, type PrizeKey } from '../../lib/navidad';
import { fmt, type Lang } from '../../i18n';
import { Dual } from '../../charts/core';

const RUNS = 3000;

const T = {
  es: {
    names: {
      first: 'El Gordo',
      second: 'Segundo premio',
      third: 'Tercer premio',
      fourth: 'Cuarto premio',
      fifth: 'Quinto premio',
      approxFirst: 'Número anterior o posterior al Gordo',
      approxSecond: 'Anterior o posterior al segundo',
      approxThird: 'Anterior o posterior al tercero',
      pedrea: 'Pedrea',
      hundreds: 'Misma centena que uno de los cuatro primeros',
      lastTwo: 'Mismas dos últimas cifras que uno de los tres primeros',
      refund: 'Reintegro (misma última cifra que el Gordo)',
    } as Record<PrizeKey, string>,
    colPrize: 'Premio',
    colAmount: 'Por décimo',
    colNet: 'Tras Hacienda',
    colOdds: 'Probabilidad',
    oneIn: (n: string) => `1 de cada ${n}`,
    tableTitle: 'Qué puede tocar en un décimo de 20 €',
    perYear: 'Décimos cada Navidad',
    years: 'Durante cuántos años',
    spent: 'Gastas en total',
    back: 'Recuperas de media',
    ahead: 'Acaban ganando dinero',
    gordo: 'Probabilidad de que te toque el Gordo alguna vez',
    big: 'Al menos un premio de 1.000 € o más',
    lifeTitle: (n: string) => `${n} vidas simuladas jugando así`,
    simple: (loss: string, years: number) =>
      `De cada 20 € que pagas por un décimo, vuelven de media 14 €, y unos 13 € después de impuestos. En ${years} años, eso es una pérdida esperada de ${loss}. Casi todo el mundo pierde: el dinero de los premios grandes sale de los muchos décimos que no cobran nada.`,
    tech: (ev: string, any: string, profit: string) =>
      `Valor esperado por décimo: 14,00 € brutos, ${ev} netos. P(algún premio) = ${any}; P(cobrar más de 20 €) = ${profit}. Los premios se pueden acumular en un mismo número, así que la distribución por décimo sale de simular sorteos completos (analysis/navidad/prizes.py). Las vidas tratan cada décimo como independiente.`,
  },
  en: {
    names: {
      first: 'El Gordo (first prize)',
      second: 'Second prize',
      third: 'Third prize',
      fourth: 'Fourth prize',
      fifth: 'Fifth prize',
      approxFirst: 'Number just before or after the Gordo',
      approxSecond: 'Just before or after the second',
      approxThird: 'Just before or after the third',
      pedrea: 'Pedrea (small prizes)',
      hundreds: 'Same hundred as one of the top four',
      lastTwo: 'Same last two digits as one of the top three',
      refund: 'Refund (same last digit as the Gordo)',
    } as Record<PrizeKey, string>,
    colPrize: 'Prize',
    colAmount: 'Per décimo',
    colNet: 'After tax',
    colOdds: 'Chance',
    oneIn: (n: string) => `1 in ${n}`,
    tableTitle: 'What a €20 décimo can win',
    perYear: 'Décimos every Christmas',
    years: 'For how many years',
    spent: 'You spend in total',
    back: 'You get back on average',
    ahead: 'End up ahead',
    gordo: 'Chance of ever winning the Gordo',
    big: 'At least one prize of €1,000 or more',
    lifeTitle: (n: string) => `${n} simulated lives playing like this`,
    simple: (loss: string, years: number) =>
      `Of every €20 you pay for a décimo, €14 comes back on average, about €13 after tax. Over ${years} years, that is an expected loss of ${loss}. Almost everybody loses: the money for the big prizes comes from the many tickets that win nothing.`,
    tech: (ev: string, any: string, profit: string) =>
      `Expected value per décimo: €14.00 gross, ${ev} net. P(any prize) = ${any}; P(winning more than €20) = ${profit}. Prizes can stack on one number, so the per-décimo distribution comes from simulating full draws (analysis/navidad/prizes.py). Lives treat each décimo as independent.`,
  },
};

export default function NavidadCalc({ lang }: { lang: Lang }) {
  const t = T[lang];
  const f = fmt(lang);
  const [perYear, setPerYear] = useState(3);
  const [years, setYears] = useState(40);
  const life = useMemo(() => simulateLives(perYear, years, RUNS, 11), [perYear, years]);
  const tickets = perYear * years;
  const expectedLoss = tickets * (PRICE - NAVIDAD.evNet);

  return (
    <div className="game navidad">
      <section className="panel wide-panel">
        <p className="panel-label">{t.tableTitle}</p>
        <div className="ug-table-scroll full">
          <table className="paytable compare">
            <thead>
              <tr>
                <th scope="col">{t.colPrize}</th>
                <th scope="col">{t.colAmount}</th>
                <th scope="col">{t.colNet}</th>
                <th scope="col">{t.colOdds}</th>
              </tr>
            </thead>
            <tbody>
              {PROGRAMME.map((r) => (
                <tr key={r.key}>
                  <th scope="row">{t.names[r.key]}</th>
                  <td className="num">{f.eur(r.perDecimo)}</td>
                  <td className="num">{f.eur(afterTax(r.perDecimo))}</td>
                  <td className="num">{t.oneIn(f.int(Math.round(NUMBERS / r.count)))}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="panel wide-panel">
        <div className="sim-controls">
          <label className="field-inline grow">
            <span>
              {t.perYear}: <strong className="num">{perYear}</strong>
            </span>
            <input type="range" min={1} max={20} value={perYear} onChange={(e) => setPerYear(Number(e.target.value))} />
          </label>
          <label className="field-inline grow">
            <span>
              {t.years}: <strong className="num">{years}</strong>
            </span>
            <input type="range" min={1} max={70} value={years} onChange={(e) => setYears(Number(e.target.value))} />
          </label>
        </div>
        <p className="panel-label">{t.lifeTitle(f.int(RUNS))}</p>
        <dl className="scores four">
          <div>
            <dt>{t.spent}</dt>
            <dd>{f.eur(life.spent)}</dd>
          </div>
          <div>
            <dt>{t.back}</dt>
            <dd className="loss">{f.eur(life.spent + life.meanNet)}</dd>
          </div>
          <div>
            <dt>{t.ahead}</dt>
            <dd>{f.pct(life.shareAhead, 1)}</dd>
          </div>
          <div>
            <dt>{t.gordo}</dt>
            <dd>{t.oneIn(f.int(Math.round(1 / chanceOfGordo(tickets))))}</dd>
          </div>
        </dl>
        <p className="figure-foot">
          <Dual
            simple={t.simple(f.eur(expectedLoss), years)}
            tech={`${t.tech(f.eur(NAVIDAD.evNet, 2), f.pct(NAVIDAD.pAny, 1), f.pct(NAVIDAD.pProfit, 1))} ${t.big}: ${f.pct(life.shareBigPrize, 1)}.`}
          />
        </p>
      </section>
    </div>
  );
}
