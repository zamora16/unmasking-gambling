import { useMemo, useState } from 'react';
import { hitFrequency, simulateSession, type Volatility } from '../../lib/volatility';
import { fmt, type Lang } from '../../i18n';
import LineChart from '../../charts/LineChart';
import { Dual } from '../../charts/core';

const VOLS: Volatility[] = ['low', 'medium', 'high'];
const RUNS = 500;
const BANKROLL = 100;
const BET = 1;

const T = {
  es: {
    vol: { low: 'Baja', medium: 'Media', high: 'Alta' } as Record<Volatility, string>,
    volLabel: 'Volatilidad',
    rtp: 'RTP',
    spins: 'Tiradas',
    replay: 'Otra sesión',
    chart: 'Tu saldo en una sesión (100 € y apuestas de 1 €)',
    peak: 'Pico de la sesión',
    peakNote: 'lo que se recuerda',
    final: 'Saldo final',
    finalNote: 'lo que se paga',
    turnover: 'Total apostado',
    hit: 'Tiradas con premio',
    busted: (n: number) => `Sin saldo en la tirada ${n}.`,
    compare: `${RUNS} sesiones de cada tipo, con el mismo RTP`,
    colVol: 'Volatilidad',
    colPeak: 'Pico medio',
    colFinal: 'Saldo final medio',
    colAhead: 'Acaban ganando',
    colBust: 'Se quedan sin nada',
    foot: 'El saldo final medio es muy parecido en las tres: lo decide el RTP. Lo que cambia es la experiencia, y la volatilidad alta regala picos memorables a cambio de arruinar a más gente.',
    start: 'Inicio',
  },
  en: {
    vol: { low: 'Low', medium: 'Medium', high: 'High' } as Record<Volatility, string>,
    volLabel: 'Volatility',
    rtp: 'RTP',
    spins: 'Spins',
    replay: 'Another session',
    chart: 'Your balance in one session (€100, €1 bets)',
    peak: 'Session peak',
    peakNote: 'what you remember',
    final: 'Final balance',
    finalNote: 'what you pay',
    turnover: 'Total wagered',
    hit: 'Spins that pay',
    busted: (n: number) => `Out of money on spin ${n}.`,
    compare: `${RUNS} sessions of each type, same RTP`,
    colVol: 'Volatility',
    colPeak: 'Average peak',
    colFinal: 'Average final balance',
    colAhead: 'End up ahead',
    colBust: 'Go bust',
    foot: 'The average final balance is very similar for all three: the RTP decides it. What changes is the experience, and high volatility hands out memorable peaks in exchange for bankrupting more people.',
    start: 'Start',
  },
};

export default function SlotSession({ lang }: { lang: Lang }) {
  const t = T[lang];
  const f = fmt(lang);
  const [vol, setVol] = useState<Volatility>('high');
  const [rtp, setRtp] = useState(95);
  const [spins, setSpins] = useState(500);
  const [seed, setSeed] = useState(7);

  const run = useMemo(() => simulateSession({ bankroll: BANKROLL, bet: BET, spins, rtp: rtp / 100, volatility: vol, seed }), [vol, rtp, spins, seed]);

  const comparison = useMemo(
    () =>
      VOLS.map((v) => {
        let peak = 0,
          fin = 0,
          ahead = 0,
          bust = 0;
        for (let s = 1; s <= RUNS; s++) {
          const r = simulateSession({ bankroll: BANKROLL, bet: BET, spins, rtp: rtp / 100, volatility: v, seed: s * 7919 });
          peak += r.peak;
          fin += r.finalBalance;
          if (r.finalBalance > BANKROLL) ahead++;
          if (r.busted) bust++;
        }
        return { v, peak: peak / RUNS, fin: fin / RUNS, ahead: ahead / RUNS, bust: bust / RUNS };
      }),
    [rtp, spins],
  );

  const step = Math.max(1, Math.floor(run.balance.length / 300));
  const points = run.balance.map((y, x) => ({ x, y })).filter((p, i, a) => i % step === 0 || i === a.length - 1 || p.x === run.peakSpin);

  return (
    <div className="game slot-session">
      <section className="panel wide-panel">
        <div className="sim-controls">
          <div className="field-inline">
            <span>{t.volLabel}</span>
            <div className="seg-group" role="radiogroup" aria-label={t.volLabel}>
              {VOLS.map((v) => (
                <button key={v} type="button" role="radio" aria-checked={vol === v} className={`seg-btn${vol === v ? ' on' : ''}`} onClick={() => setVol(v)}>
                  {t.vol[v]}
                </button>
              ))}
            </div>
          </div>
          <label className="field-inline grow">
            <span>
              {t.rtp}: <strong className="num">{rtp} %</strong>
            </span>
            <input type="range" min={85} max={99} value={rtp} onChange={(e) => setRtp(Number(e.target.value))} />
          </label>
          <label className="field-inline grow">
            <span>
              {t.spins}: <strong className="num">{f.int(spins)}</strong>
            </span>
            <input type="range" min={100} max={2000} step={100} value={spins} onChange={(e) => setSpins(Number(e.target.value))} />
          </label>
          <button type="button" className="btn ghost small" onClick={() => setSeed((s) => s + 1)}>
            ↻ {t.replay}
          </button>
        </div>

        <p className="panel-label">{t.chart}</p>
        <LineChart
          series={[{ key: 'b', label: t.final, color: 'var(--series-1)', points }]}
          height={240}
          zero={0}
          hLines={[{ y: BANKROLL, label: f.eur(BANKROLL) }]}
          annotations={[{ x: run.peakSpin, label: `${t.peak}: ${f.eur(run.peak)}` }]}
          xFormat={(x) => f.int(x)}
          yFormat={(y) => f.eur(Math.abs(y) < 0.5 ? 0 : y)}
          tooltipX={(x) => `${t.spins}: ${f.int(x)}`}
          ariaLabel={t.chart}
        />

        <dl className="scores four">
          <div>
            <dt>
              {t.peak} <small>· {t.peakNote}</small>
            </dt>
            <dd className="win">{f.eur(run.peak)}</dd>
          </div>
          <div>
            <dt>
              {t.final} <small>· {t.finalNote}</small>
            </dt>
            <dd className={run.finalBalance < BANKROLL ? 'loss' : 'win'}>{f.eur(run.finalBalance)}</dd>
          </div>
          <div>
            <dt>{t.turnover}</dt>
            <dd>{f.eur(run.turnover)}</dd>
          </div>
          <div>
            <dt>{t.hit}</dt>
            <dd>{f.pct(hitFrequency(vol), 0)}</dd>
          </div>
        </dl>
        {run.busted && <p className="loss">{t.busted(run.spins)}</p>}
      </section>

      <section className="panel wide-panel">
        <p className="panel-label">{t.compare}</p>
        <table className="paytable compare">
          <thead>
            <tr>
              <th scope="col">{t.colVol}</th>
              <th scope="col">{t.colPeak}</th>
              <th scope="col">{t.colFinal}</th>
              <th scope="col">{t.colAhead}</th>
              <th scope="col">{t.colBust}</th>
            </tr>
          </thead>
          <tbody>
            {comparison.map((c) => (
              <tr key={c.v} className={c.v === vol ? 'on' : ''}>
                <th scope="row">{t.vol[c.v]}</th>
                <td className="num">{f.eur(c.peak)}</td>
                <td className="num">{f.eur(c.fin)}</td>
                <td className="num">{f.pct(c.ahead, 0)}</td>
                <td className="num">{f.pct(c.bust, 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p className="figure-foot">
          <Dual simple={t.foot} tech={`${t.foot} ${lang === 'es' ? 'Sin ruina' : 'Without ruin'}, E[final] = 100 − n·(1 − RTP) = ${f.eur(BANKROLL - spins * (1 - rtp / 100))}.`} />
        </p>
      </section>
    </div>
  );
}
