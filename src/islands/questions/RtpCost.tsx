import { useState } from 'react';
import { fmt, type Lang } from '../../i18n';
import { Dual } from '../../charts/core';

const BETS = [0.1, 0.2, 0.5, 1, 2, 5];

const T = {
  es: {
    rtp: 'RTP de la máquina',
    bet: 'Apuesta por tirada',
    pace: 'Tiradas por hora',
    paceNote: (s: string) => `una cada ${s} s`,
    hours: 'Horas a la semana',
    through: 'Pasa por la máquina cada hora',
    perHour: 'Te cuesta cada hora, de media',
    perWeek: 'Cada semana',
    perYear: 'En un año',
    turns: (x: string, b: string) => `Tus primeros ${b} dan vueltas: ganas, vuelves a apostar lo ganado, y la máquina cobra su parte cada vez. Hasta quedarte a cero, esos ${b} se apuestan de media unas ${x} veces.`,
    tech: (edge: string) => `Coste esperado = apuesta × tiradas × (1 − RTP), con 1 − RTP = ${edge}. Por la identidad de Wald, si juegas hasta arruinarte, E[total apostado] ≈ saldo / (1 − RTP). El RTP se mide sobre millones de tiradas: en una sesión corta el resultado varía mucho, pero la media no.`,
    start: 'Saldo inicial',
  },
  en: {
    rtp: 'Machine RTP',
    bet: 'Bet per spin',
    pace: 'Spins per hour',
    paceNote: (s: string) => `one every ${s} s`,
    hours: 'Hours a week',
    through: 'Goes through the machine each hour',
    perHour: 'Costs you each hour, on average',
    perWeek: 'Each week',
    perYear: 'In a year',
    turns: (x: string, b: string) => `Your first ${b} keeps going round: you win, you stake the winnings again, and the machine takes its cut every time. Before it hits zero, that ${b} gets staked about ${x} times on average.`,
    tech: (edge: string) => `Expected cost = bet × spins × (1 − RTP), with 1 − RTP = ${edge}. By Wald’s identity, if you play until you are broke, E[total staked] ≈ balance / (1 − RTP). RTP is measured over millions of spins: a short session varies a lot, the average does not.`,
    start: 'Starting balance',
  },
};

export default function RtpCost({ lang }: { lang: Lang }) {
  const t = T[lang];
  const f = fmt(lang);
  const [rtp, setRtp] = useState(96);
  const [bet, setBet] = useState(1);
  const [pace, setPace] = useState(600);
  const [hours, setHours] = useState(3);
  const [start, setStart] = useState(100);
  const edge = 1 - rtp / 100;
  const through = bet * pace;
  const hour = through * edge;

  return (
    <div className="game rtp-cost">
      <section className="panel wide-panel">
        <div className="sim-controls">
          <label className="field-inline grow">
            <span>
              {t.rtp}: <strong className="num">{f.num(rtp, 1)} %</strong>
            </span>
            <input type="range" min={85} max={99} step={0.5} value={rtp} onChange={(e) => setRtp(Number(e.target.value))} />
          </label>
          <label className="field-inline">
            <span>{t.bet}</span>
            <select value={bet} onChange={(e) => setBet(Number(e.target.value))}>
              {BETS.map((b) => (
                <option key={b} value={b}>
                  {f.eur(b, b < 1 ? 2 : 0)}
                </option>
              ))}
            </select>
          </label>
          <label className="field-inline grow">
            <span>
              {t.pace}: <strong className="num">{f.int(pace)}</strong> <small className="muted">({t.paceNote(f.num(3600 / pace, 1))})</small>
            </span>
            <input type="range" min={120} max={1200} step={60} value={pace} onChange={(e) => setPace(Number(e.target.value))} />
          </label>
          <label className="field-inline grow">
            <span>
              {t.hours}: <strong className="num">{hours}</strong>
            </span>
            <input type="range" min={1} max={30} value={hours} onChange={(e) => setHours(Number(e.target.value))} />
          </label>
        </div>

        <dl className="scores four">
          <div>
            <dt>{t.through}</dt>
            <dd>{f.eur(through)}</dd>
          </div>
          <div>
            <dt>{t.perHour}</dt>
            <dd className="loss">−{f.eur(hour, hour < 10 ? 2 : 0)}</dd>
          </div>
          <div>
            <dt>{t.perWeek}</dt>
            <dd className="loss">−{f.eur(hour * hours)}</dd>
          </div>
          <div>
            <dt>{t.perYear}</dt>
            <dd className="loss">−{f.eur(hour * hours * 52)}</dd>
          </div>
        </dl>

        <div className="sim-controls">
          <label className="field-inline">
            <span>{t.start}</span>
            <input type="number" min={1} step={10} value={start} onChange={(e) => setStart(Math.max(0, Number(e.target.value)))} />
          </label>
        </div>
        <p>{t.turns(f.int(1 / edge), f.eur(start))}</p>
        <p className="figure-foot">
          <Dual simple="" tech={t.tech(f.pct(edge, 1))} />
        </p>
      </section>
    </div>
  );
}
