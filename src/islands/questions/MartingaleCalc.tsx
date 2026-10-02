import { useMemo, useState } from 'react';
import { martingaleSeries, chanceOfGoal } from '../../lib/martingale';
import { mulberry32 } from '../../lib/rng';
import { fmt, type Lang } from '../../i18n';
import LineChart from '../../charts/LineChart';
import { Dual } from '../../charts/core';

const LIMITS = [Infinity, 100, 500, 1000, 5000];
const MAX_SPINS = 3000;

const T = {
  es: {
    bankroll: 'Dinero para jugar',
    base: 'Apuesta inicial',
    limit: 'Límite de la mesa',
    none: 'Sin límite',
    goal: 'Quiero ganar',
    wheel: 'Ruleta',
    euro: 'Europea (un cero)',
    amer: 'Americana (dos ceros)',
    colN: 'Apuesta',
    colStake: 'Apuestas',
    colCum: 'Llevas apostado',
    colReach: 'Probabilidad de llegar aquí',
    cantMoney: (m: string) => `No puedes: te harían falta ${m} y no los tienes.`,
    cantLimit: (m: string) => `No puedes: ${m} supera el límite de la mesa.`,
    seq: 'Así crece la apuesta al rojo cada vez que sale negro',
    pWin: 'Ganas la serie',
    pLose: 'Pierdes la serie',
    ev: 'Resultado medio por serie',
    goalChance: (g: string) => `Llegar a +${g} antes de perder una serie`,
    winsBefore: 'Series que ganas, de media, antes de perder una',
    night: 'Una noche con la martingala',
    nightSub: 'Cada tirada al rojo, doblando tras cada pérdida. Si no puedes doblar, vuelves a empezar con lo que te queda.',
    spins: 'Tiradas',
    balance: 'Saldo',
    another: 'Otra noche',
    broke: (n: string) => `Sin dinero para la apuesta mínima en la tirada ${n}.`,
    survived: (n: string, b: string) => `Tras ${n} tiradas sigues con ${b}.`,
    simple: (n: number, loss: string) =>
      `Ganas casi siempre, pero solo la apuesta inicial. Cuando pierdes, pierdes ${loss} de golpe: lo de ${n} victorias juntas. El sistema no cambia cuánto pierdes de media, solo cómo: muchas alegrías pequeñas y una caída grande.`,
  },
  en: {
    bankroll: 'Money to play with',
    base: 'Starting bet',
    limit: 'Table limit',
    none: 'No limit',
    goal: 'I want to win',
    wheel: 'Wheel',
    euro: 'European (one zero)',
    amer: 'American (two zeros)',
    colN: 'Bet',
    colStake: 'Stake',
    colCum: 'Staked so far',
    colReach: 'Chance of getting here',
    cantMoney: (m: string) => `You can’t: you would need ${m} and you don’t have it.`,
    cantLimit: (m: string) => `You can’t: ${m} is over the table limit.`,
    seq: 'How the bet on red grows every time black comes up',
    pWin: 'You win the series',
    pLose: 'You lose the series',
    ev: 'Average result per series',
    goalChance: (g: string) => `Reaching +${g} before losing a series`,
    winsBefore: 'Series you win, on average, before losing one',
    night: 'One night with the martingale',
    nightSub: 'Every spin on red, doubling after every loss. When you can’t double, you start again with what is left.',
    spins: 'Spins',
    balance: 'Balance',
    another: 'Another night',
    broke: (n: string) => `Not enough left for the minimum bet on spin ${n}.`,
    survived: (n: string, b: string) => `After ${n} spins you still have ${b}.`,
    simple: (n: number, loss: string) =>
      `You win almost every time, but only your starting bet. When you lose, you lose ${loss} in one go: the winnings of ${n} wins together. The system does not change how much you lose on average, only how: many small joys and one big fall.`,
  },
};

/** One player's night: martingale on red until broke or MAX_SPINS. */
function night(bankroll: number, base: number, limit: number, p: number, seed: number) {
  const rand = mulberry32(seed);
  let b = bankroll;
  let stake = base;
  const pts = [{ x: 0, y: b }];
  let peak = b;
  let peakAt = 0;
  let t = 0;
  while (t < MAX_SPINS && b >= base) {
    if (stake > b || stake > limit) stake = base; // can't double: start over
    t++;
    if (rand() < p) {
      b += stake;
      stake = base;
    } else {
      b -= stake;
      stake *= 2;
    }
    pts.push({ x: t, y: b });
    if (b > peak) (peak = b), (peakAt = t);
  }
  return { pts, final: b, spins: t, broke: b < base, peak, peakAt };
}

export default function MartingaleCalc({ lang }: { lang: Lang }) {
  const t = T[lang];
  const f = fmt(lang);
  const [bankroll, setBankroll] = useState(100);
  const [base, setBase] = useState(1);
  const [limit, setLimit] = useState(Infinity);
  const [goal, setGoal] = useState(50);
  const [american, setAmerican] = useState(false);
  const [seed, setSeed] = useState(3);
  const p = american ? 18 / 38 : 18 / 37;

  const ok = bankroll > 0 && base > 0 && base <= bankroll;
  const s = useMemo(() => martingaleSeries({ bankroll, base, tableLimit: limit, p }), [bankroll, base, limit, p]);
  const goalP = useMemo(() => (ok && goal > 0 ? chanceOfGoal({ bankroll, base, tableLimit: limit, p }, goal) : 0), [ok, bankroll, base, limit, p, goal]);
  const run = useMemo(() => night(bankroll, base, limit, p, seed), [bankroll, base, limit, p, seed]);
  const step = Math.max(1, Math.floor(run.pts.length / 400));
  const pts = run.pts.filter((q, i, a) => i % step === 0 || i === a.length - 1 || q.x === run.peakAt);
  const next = s.maxBets ? s.steps[s.maxBets - 1].stake * 2 : base;
  const nextCum = s.maxBets ? s.steps[s.maxBets - 1].cumulative + next : base;
  const winsToRecover = base > 0 ? Math.round(s.loss / base) : 0;
  const money = (v: number) => f.eur(v, v % 1 ? 2 : 0);

  return (
    <div className="game martingale">
      <section className="panel wide-panel">
        <div className="sim-controls">
          <label className="field-inline">
            <span>{t.bankroll}</span>
            <input type="number" min={1} step={10} value={bankroll} onChange={(e) => setBankroll(Math.max(0, Number(e.target.value)))} />
          </label>
          <label className="field-inline">
            <span>{t.base}</span>
            <input type="number" min={0.1} step={1} value={base} onChange={(e) => setBase(Math.max(0, Number(e.target.value)))} />
          </label>
          <label className="field-inline">
            <span>{t.limit}</span>
            <select value={String(limit)} onChange={(e) => setLimit(Number(e.target.value))}>
              {LIMITS.map((l) => (
                <option key={l} value={String(l)}>
                  {l === Infinity ? t.none : f.eur(l)}
                </option>
              ))}
            </select>
          </label>
          <label className="field-inline">
            <span>{t.goal}</span>
            <input type="number" min={1} step={10} value={goal} onChange={(e) => setGoal(Math.max(0, Number(e.target.value)))} />
          </label>
          <div className="field-inline">
            <span>{t.wheel}</span>
            <div className="seg-group" role="radiogroup" aria-label={t.wheel}>
              <button type="button" role="radio" aria-checked={!american} className={`seg-btn${!american ? ' on' : ''}`} onClick={() => setAmerican(false)}>
                {t.euro}
              </button>
              <button type="button" role="radio" aria-checked={american} className={`seg-btn${american ? ' on' : ''}`} onClick={() => setAmerican(true)}>
                {t.amer}
              </button>
            </div>
          </div>
        </div>

        {ok && (
          <>
            <p className="panel-label">{t.seq}</p>
            <div className="ug-table-scroll">
              <table className="paytable compare">
                <thead>
                  <tr>
                    <th scope="col">{t.colN}</th>
                    <th scope="col">{t.colStake}</th>
                    <th scope="col">{t.colCum}</th>
                    <th scope="col">{t.colReach}</th>
                  </tr>
                </thead>
                <tbody>
                  {s.steps.map((st) => (
                    <tr key={st.n} className={st.n === s.maxBets ? 'on' : ''}>
                      <th scope="row">{st.n}</th>
                      <td className="num">{money(st.stake)}</td>
                      <td className="num">{money(st.cumulative)}</td>
                      <td className="num">{st.reach < 0.001 ? `1 ${lang === 'es' ? 'de cada' : 'in'} ${f.int(1 / st.reach)}` : f.pct(st.reach, 1)}</td>
                    </tr>
                  ))}
                  <tr className="muted">
                    <th scope="row">{s.maxBets + 1}</th>
                    <td colSpan={3}>{s.stoppedBy === 'limit' ? t.cantLimit(money(next)) : t.cantMoney(money(nextCum))}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <dl className="scores four">
              <div>
                <dt>{t.pWin}</dt>
                <dd className="win">
                  {f.pct(s.pWin, 2)} <small>· +{money(base)}</small>
                </dd>
              </div>
              <div>
                <dt>{t.pLose}</dt>
                <dd className="loss">
                  {f.pct(s.pLose, 2)} <small>· −{money(s.loss)}</small>
                </dd>
              </div>
              <div>
                <dt>{t.ev}</dt>
                <dd className="loss">{f.eur(s.ev, 3)}</dd>
              </div>
              <div>
                <dt>{t.goalChance(money(goal))}</dt>
                <dd>{f.pct(goalP, 1)}</dd>
              </div>
            </dl>
            <p className="figure-foot">
              <Dual
                simple={t.simple(winsToRecover, money(s.loss))}
                tech={`${t.winsBefore}: ${f.num(s.winsBeforeLoss, 1)}. E[series] = p_win·b − p_lose·L = ${f.num(s.pWin, 4)}·${base} − ${f.num(s.pLose, 4)}·${s.loss} = ${f.num(s.ev, 4)} = −(1 − 2p)·E[staked] = −${f.num(1 - 2 * p, 4)} · ${f.num(s.staked, 3)}.`}
              />
            </p>
          </>
        )}
      </section>

      {ok && (
        <section className="panel wide-panel">
          <div className="sim-controls">
            <p className="panel-label grow">{t.night}</p>
            <button type="button" className="btn ghost small" onClick={() => setSeed((x) => x + 1)}>
              ↻ {t.another}
            </button>
          </div>
          <p className="figure-sub">{t.nightSub}</p>
          <LineChart
            series={[{ key: 'b', label: t.balance, color: 'var(--series-1)', points: pts }]}
            height={240}
            zero={0}
            hLines={[{ y: bankroll, label: f.eur(bankroll) }]}
            xFormat={(x) => f.int(x)}
            yFormat={(y) => f.eur(y)}
            tooltipX={(x) => `${t.spins}: ${f.int(x)}`}
            ariaLabel={t.night}
          />
          <p className={run.broke ? 'loss' : ''}>{run.broke ? t.broke(f.int(run.spins)) : t.survived(f.int(run.spins), money(run.final))}</p>
        </section>
      )}
    </div>
  );
}
