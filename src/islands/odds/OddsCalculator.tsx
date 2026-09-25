import { useState } from 'react';
import { overround, implied, proportional, power, shin } from '../../lib/odds';
import { fmt, type Lang } from '../../i18n';
import { Dual } from '../../charts/core';

const T = {
  es: {
    title: 'Calculadora de la comisión',
    sub: 'Escribe las cuotas decimales de un partido (local, empate, visitante) y mira cuánto se queda la casa.',
    outcomes: ['Local', 'Empate', 'Visitante'],
    odds: 'Cuota',
    implied: 'Implícita',
    prop: 'Proporcional',
    pow: 'Potencia',
    shin: 'Shin',
    fair: 'Probabilidad sin comisión',
    ret: 'Te devuelve por cada 1 €',
    margin: 'Comisión de la casa',
    marginNote: (m: string, r: string) => `Por cada 100 € repartidos «en justo» entre los tres resultados, la casa se queda ${m}. Una apuesta devuelve de media ${r} por euro.`,
    invalid: 'Las cuotas decimales tienen que ser mayores que 1.',
    retNote: 'La probabilidad sin comisión se estima con el método de Shin. La última columna es lo que te devuelve de media cada euro apostado a ese resultado.',
    presets: 'Probar con',
    presetList: [
      { label: 'Partido igualado', o: [2.6, 3.2, 2.8] },
      { label: 'Gran favorito', o: [1.25, 6.5, 11] },
      { label: 'Casa con comisión alta', o: [1.8, 3.2, 3.9] },
    ],
  },
  en: {
    title: 'Fee calculator',
    sub: 'Type a match’s decimal odds (home, draw, away) and see how much the bookmaker keeps.',
    outcomes: ['Home', 'Draw', 'Away'],
    odds: 'Odds',
    implied: 'Implied',
    prop: 'Proportional',
    pow: 'Power',
    shin: 'Shin',
    fair: 'Chance without the fee',
    ret: 'Pays back per €1',
    margin: 'Bookmaker’s fee',
    marginNote: (m: string, r: string) => `For every €100 spread “fairly” across the three outcomes, the bookmaker keeps ${m}. A bet pays back ${r} per euro on average.`,
    invalid: 'Decimal odds must be greater than 1.',
    retNote: 'The chance without the fee is estimated with Shin’s method. The last column is what each euro bet on that result pays back on average.',
    presets: 'Try',
    presetList: [
      { label: 'Close match', o: [2.6, 3.2, 2.8] },
      { label: 'Heavy favourite', o: [1.25, 6.5, 11] },
      { label: 'High-fee bookmaker', o: [1.8, 3.2, 3.9] },
    ],
  },
};

export default function OddsCalculator({ lang }: { lang: Lang }) {
  const t = T[lang];
  const f = fmt(lang);
  const [raw, setRaw] = useState(['1.85', '3.60', '4.50']);
  const odds = raw.map((r) => Number(r.replace(',', '.')));
  const valid = odds.every((o) => Number.isFinite(o) && o > 1);
  const ov = valid ? overround(odds) : 0;
  const imp = valid ? implied(odds) : [];
  const pr = valid ? proportional(odds) : [];
  const pw = valid ? power(odds) : [];
  const sh = valid ? shin(odds).probs : [];
  const payback = valid ? 1 / (1 + ov) : 0;

  return (
    <div className="calc">
      <div className="calc-head">
        <p className="figure-title">{t.title}</p>
        <p className="figure-sub">{t.sub}</p>
        <div className="calc-presets">
          <span>{t.presets}:</span>
          {t.presetList.map((p) => (
            <button key={p.label} type="button" onClick={() => setRaw(p.o.map((o) => o.toFixed(2)))}>
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="calc-inputs">
        {t.outcomes.map((o, i) => (
          <label key={o}>
            <span>{o}</span>
            <input
              inputMode="decimal"
              value={raw[i]}
              onChange={(e) => setRaw(raw.map((r, j) => (j === i ? e.target.value : r)))}
              aria-label={`${t.odds} ${o}`}
            />
          </label>
        ))}
        <div className="calc-margin" aria-live="polite">
          <span>{t.margin}</span>
          <strong className="num">{valid ? f.pct(ov, 2) : '—'}</strong>
        </div>
      </div>
      {!valid ? (
        <p className="calc-error">{t.invalid}</p>
      ) : (
        <>
          <p className="calc-note">{t.marginNote(f.eur((100 * ov) / (1 + ov), 2), f.eur(payback, 3))}</p>
          <div className="ug-table-scroll" style={{ maxHeight: 'none' }}>
            <table className="ug-table">
              <thead>
                <tr>
                  <th scope="col"></th>
                  <th scope="col">{t.odds}</th>
                  <th scope="col" className="only-tech">{t.implied}</th>
                  <th scope="col" className="only-tech">{t.prop}</th>
                  <th scope="col" className="only-tech">{t.pow}</th>
                  <th scope="col"><Dual simple={t.fair} tech={t.shin} /></th>
                  <th scope="col">{t.ret}</th>
                </tr>
              </thead>
              <tbody>
                {t.outcomes.map((o, i) => (
                  <tr key={o}>
                    <th scope="row">{o}</th>
                    <td>{f.num(odds[i], 2)}</td>
                    <td className="only-tech">{f.pct(imp[i])}</td>
                    <td className="only-tech">{f.pct(pr[i])}</td>
                    <td className="only-tech">{f.pct(pw[i])}</td>
                    <td>{f.pct(sh[i])}</td>
                    <td>{f.eur(sh[i] * odds[i], 3)}</td>
                  </tr>
                ))}
                <tr>
                  <th scope="row">Σ</th>
                  <td></td>
                  <td className="only-tech">{f.pct(imp.reduce((a, b) => a + b, 0))}</td>
                  <td className="only-tech">{f.pct(1)}</td>
                  <td className="only-tech">{f.pct(1)}</td>
                  <td>{f.pct(1)}</td>
                  <td></td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="figure-foot">{t.retNote}</p>
        </>
      )}
    </div>
  );
}
