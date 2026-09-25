import { useMemo, useRef, useState } from 'react';
import { WHEEL, colour, settle, covers, payoutToOne, type Bet, type BetKind } from '../../lib/roulette';
import { fmt, type Lang } from '../../i18n';
import { Dual } from '../../charts/core';

const T = {
  es: {
    bet: 'Tu apuesta',
    kinds: { red: 'Rojo', black: 'Negro', even: 'Par', odd: 'Impar', low: '1–18', high: '19–36', dozen1: '1ª docena', dozen2: '2ª docena', dozen3: '3ª docena', number: 'Un número' } as Record<BetKind, string>,
    stake: 'Ficha',
    spin: 'Girar',
    spin100: 'Girar 100 veces',
    reset: 'Empezar de nuevo',
    balance: 'Tu dinero',
    spins: 'Tiradas',
    wagered: 'Apostado',
    net: 'Resultado',
    expected: 'Lo que predice la ventaja',
    last: 'Últimos números',
    won: (x: string) => `Ganas ${x}`,
    lost: (x: string) => `Pierdes ${x}`,
    pays: (x: number) => `Paga ${x} a 1`,
    chance: (p: string) => `Probabilidad de acertar: ${p}`,
    streak: (n: number, c: string, p: string) => `Han salido ${n} ${c} seguidos. ¿Toca que cambie? No: la ruleta no tiene memoria y la probabilidad de ${c.replace(/s$/, '')} en la próxima tirada sigue siendo ${p}.`,
    reds: 'rojos',
    blacks: 'negros',
    broke: 'Te has quedado sin dinero.',
    number: 'Número',
    wheelLabel: 'Ruleta europea',
  },
  en: {
    bet: 'Your bet',
    kinds: { red: 'Red', black: 'Black', even: 'Even', odd: 'Odd', low: '1–18', high: '19–36', dozen1: '1st dozen', dozen2: '2nd dozen', dozen3: '3rd dozen', number: 'A number' } as Record<BetKind, string>,
    stake: 'Chip',
    spin: 'Spin',
    spin100: 'Spin 100 times',
    reset: 'Start again',
    balance: 'Your money',
    spins: 'Spins',
    wagered: 'Wagered',
    net: 'Result',
    expected: 'What the edge predicts',
    last: 'Last numbers',
    won: (x: string) => `You win ${x}`,
    lost: (x: string) => `You lose ${x}`,
    pays: (x: number) => `Pays ${x} to 1`,
    chance: (p: string) => `Chance of winning: ${p}`,
    streak: (n: number, c: string, p: string) => `${n} ${c} in a row. Is the other colour “due”? No: the wheel has no memory, and the chance of ${c.replace(/s$/, '')} on the next spin is still ${p}.`,
    reds: 'reds',
    blacks: 'blacks',
    broke: 'You have run out of money.',
    number: 'Number',
    wheelLabel: 'European roulette wheel',
  },
};

const KINDS: BetKind[] = ['red', 'black', 'even', 'odd', 'low', 'high', 'dozen1', 'dozen2', 'dozen3', 'number'];
const SECTOR = 360 / 37;
const FILL = { red: '#b3261e', black: '#141414', green: '#0f7a4a' };

export default function Roulette({ lang }: { lang: Lang }) {
  const t = T[lang];
  const f = fmt(lang);
  const [kind, setKind] = useState<BetKind>('red');
  const [num, setNum] = useState(17);
  const [stake, setStake] = useState(5);
  const [balance, setBalance] = useState(100);
  const [history, setHistory] = useState<number[]>([]);
  const [wagered, setWagered] = useState(0);
  const [spins, setSpins] = useState(0);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [last, setLast] = useState<{ n: number; net: number } | null>(null);
  const timer = useRef<number | null>(null);

  const bet: Bet = kind === 'number' ? { kind, number: num } : { kind };
  const k = covers(bet).length;

  const apply = (ns: number[]) => {
    let b = balance;
    let w = 0;
    let lastNet = 0;
    const played: number[] = [];
    for (const n of ns) {
      const s = Math.min(stake, b);
      if (s <= 0) break;
      const net = settle(bet, n) * s;
      b += net;
      w += s;
      lastNet = net;
      played.push(n);
    }
    setBalance(b);
    setWagered((x) => x + w);
    setSpins((x) => x + played.length);
    setHistory((h) => [...played.reverse(), ...h].slice(0, 30));
    if (played.length) setLast({ n: played[0], net: lastNet });
  };

  const random = () => {
    const a = new Uint32Array(1);
    crypto.getRandomValues(a);
    return a[0] % 37;
  };

  const spin = () => {
    if (spinning || balance <= 0) return;
    const n = random();
    const idx = WHEEL.indexOf(n);
    const current = ((rotation % 360) + 360) % 360;
    const target = 360 - idx * SECTOR;
    const delta = ((target - current + 360) % 360) + 360 * 5;
    setSpinning(true);
    setLast(null);
    setRotation(rotation + delta);
    timer.current = window.setTimeout(() => {
      apply([n]);
      setSpinning(false);
    }, 3200);
  };

  const spinMany = () => {
    if (spinning || balance <= 0) return;
    const ns = Array.from({ length: 100 }, random);
    const lastN = ns[ns.length - 1];
    setRotation((r) => r + ((360 - WHEEL.indexOf(lastN) * SECTOR - (((r % 360) + 360) % 360) + 360) % 360));
    apply(ns);
  };

  const reset = () => {
    if (timer.current) clearTimeout(timer.current);
    setBalance(100);
    setHistory([]);
    setWagered(0);
    setSpins(0);
    setLast(null);
    setSpinning(false);
  };

  const streak = useMemo(() => {
    if (!history.length) return null;
    const c = colour(history[0]);
    if (c === 'green') return null;
    let n = 0;
    for (const h of history) {
      if (colour(h) === c) n++;
      else break;
    }
    return n >= 3 ? { n, c } : null;
  }, [history]);

  const sectors = WHEEL.map((n, i) => {
    const a0 = ((i * SECTOR - SECTOR / 2 - 90) * Math.PI) / 180;
    const a1 = ((i * SECTOR + SECTOR / 2 - 90) * Math.PI) / 180;
    const R = 140;
    const r = 96;
    const p = (a: number, rad: number) => `${150 + rad * Math.cos(a)},${150 + rad * Math.sin(a)}`;
    const mid = ((i * SECTOR - 90) * Math.PI) / 180;
    return (
      <g key={n}>
        <path d={`M${p(a0, r)} L${p(a0, R)} A${R},${R} 0 0 1 ${p(a1, R)} L${p(a1, r)} A${r},${r} 0 0 0 ${p(a0, r)} Z`} fill={FILL[colour(n)]} stroke="#c9a45c" strokeWidth={0.6} />
        <text
          x={150 + 124 * Math.cos(mid)}
          y={150 + 124 * Math.sin(mid)}
          fill="#f2ecdf"
          fontSize={10.5}
          fontWeight={700}
          textAnchor="middle"
          dominantBaseline="central"
          transform={`rotate(${i * SECTOR} ${150 + 124 * Math.cos(mid)} ${150 + 124 * Math.sin(mid)})`}
        >
          {n}
        </text>
      </g>
    );
  });

  return (
    <div className="game roulette">
      <div className="wheel-col">
        <div className="wheel-wrap">
          <svg viewBox="0 0 300 300" role="img" aria-label={t.wheelLabel}>
            <circle cx="150" cy="150" r="148" fill="#3a2a14" stroke="#c9a45c" strokeWidth="2" />
            <g style={{ transform: `rotate(${rotation}deg)`, transformOrigin: '150px 150px', transition: spinning ? 'transform 3.1s cubic-bezier(0.17, 0.67, 0.2, 1)' : 'none' }}>
              {sectors}
              <circle cx="150" cy="150" r="96" fill="#1b3428" stroke="#c9a45c" strokeWidth="1.5" />
              {Array.from({ length: 8 }, (_, i) => (
                <line key={i} x1="150" y1="150" x2={150 + 60 * Math.cos((i * Math.PI) / 4)} y2={150 + 60 * Math.sin((i * Math.PI) / 4)} stroke="#c9a45c" strokeWidth="3" strokeLinecap="round" />
              ))}
              <circle cx="150" cy="150" r="16" fill="#c9a45c" />
            </g>
            <path d="M150 4 L158 22 L142 22 Z" fill="#f2ecdf" stroke="#0e1d16" strokeWidth="1" />
          </svg>
        </div>
        <div className="result" aria-live="polite">
          {spinning ? (
            <span className="muted">…</span>
          ) : last ? (
            <>
              <span className={`chip-num ${colour(last.n)}`}>{last.n}</span>
              <span className={last.net > 0 ? 'win' : 'loss'}>{last.net > 0 ? t.won(f.eur(last.net)) : t.lost(f.eur(-last.net))}</span>
            </>
          ) : (
            <span className="muted">{t.chance(f.pct(k / 37, 1))}</span>
          )}
        </div>
      </div>

      <div className="panel">
        <p className="panel-label">{t.bet}</p>
        <div className="bet-grid" role="group" aria-label={t.bet}>
          {KINDS.map((kd) => (
            <button key={kd} type="button" className={`bet ${kd} ${kind === kd ? 'on' : ''}`} aria-pressed={kind === kd} onClick={() => setKind(kd)}>
              {t.kinds[kd]}
            </button>
          ))}
        </div>
        {kind === 'number' && (
          <label className="num-pick">
            <span>{t.number}</span>
            <select value={num} onChange={(e) => setNum(Number(e.target.value))}>
              {Array.from({ length: 37 }, (_, i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </label>
        )}
        <p className="bet-info">
          {t.pays(payoutToOne(bet))} · {t.chance(f.pct(k / 37, 1))}
        </p>

        <p className="panel-label">{t.stake}</p>
        <div className="chips" role="group" aria-label={t.stake}>
          {[1, 5, 10, 25].map((c) => (
            <button key={c} type="button" className={`chip c${c} ${stake === c ? 'on' : ''}`} aria-pressed={stake === c} onClick={() => setStake(c)}>
              {c}
            </button>
          ))}
        </div>

        <div className="actions">
          <button type="button" className="btn" onClick={spin} disabled={spinning || balance <= 0}>
            {t.spin}
          </button>
          <button type="button" className="btn ghost" onClick={spinMany} disabled={spinning || balance <= 0}>
            {t.spin100}
          </button>
          <button type="button" className="link" onClick={reset}>
            {t.reset}
          </button>
        </div>

        <dl className="scores">
          <div>
            <dt>{t.balance}</dt>
            <dd className={balance < 100 ? 'loss' : balance > 100 ? 'win' : ''}>{f.eur(balance)}</dd>
          </div>
          <div>
            <dt>{t.spins}</dt>
            <dd>{f.int(spins)}</dd>
          </div>
          <div>
            <dt>{t.wagered}</dt>
            <dd>{f.eur(wagered)}</dd>
          </div>
          <div>
            <dt>
              <Dual simple={t.expected} tech={`${t.expected} (−${f.eur(wagered)}/37)`} />
            </dt>
            <dd>{f.eur(-wagered / 37, 2)}</dd>
          </div>
        </dl>
        {balance <= 0 && <p className="loss">{t.broke}</p>}
        {streak && <p className="streak">{t.streak(streak.n, streak.c === 'red' ? t.reds : t.blacks, f.pct(18 / 37, 1))}</p>}

        {history.length > 0 && (
          <>
            <p className="panel-label">{t.last}</p>
            <div className="history">
              {history.map((n, i) => (
                <span key={i} className={`chip-num small ${colour(n)}`}>
                  {n}
                </span>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
