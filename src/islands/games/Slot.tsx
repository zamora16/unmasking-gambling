import { useRef, useState } from 'react';
import { STRIP, spinReel, window3, payout, isNearMiss, exactRTP, PAYTABLE, type Sym } from '../../lib/slot';
import { fmt, type Lang } from '../../i18n';
import LineChart from '../../charts/LineChart';

const T = {
  es: {
    spin: 'Tirar',
    auto: (n: number) => `${n} tiradas`,
    reset: 'Empezar de nuevo',
    credit: 'Tu dinero',
    spins: 'Tiradas',
    wagered: 'Apostado',
    won: 'Premios',
    nearMiss: 'Casi-aciertos',
    nearNote: 'Un 7 justo encima o debajo de la línea, sin premio.',
    rtpLabel: 'Devuelve de media',
    win: (x: string) => `¡Premio! ${x}`,
    lose: 'Sin premio',
    near: 'Casi… (y sin premio)',
    broke: 'Te has quedado sin dinero.',
    paytable: 'Tabla de premios (por 1 € apostado)',
    three: (s: string) => `${s} ${s} ${s}`,
    suits: 'Tres palos cualesquiera',
    twoSpades: '♠ ♠ en los dos primeros rodillos',
    oneSpade: '♠ en el primer rodillo',
    chart: 'Tu dinero en cada tirada',
    stake: 'Apuesta: 1 €',
    machine: 'Máquina tragaperras de tres rodillos',
  },
  en: {
    spin: 'Spin',
    auto: (n: number) => `${n} spins`,
    reset: 'Start again',
    credit: 'Your money',
    spins: 'Spins',
    wagered: 'Wagered',
    won: 'Prizes',
    nearMiss: 'Near-misses',
    nearNote: 'A 7 just above or below the line, with no prize.',
    rtpLabel: 'Pays back on average',
    win: (x: string) => `Win! ${x}`,
    lose: 'No prize',
    near: 'So close… (and no prize)',
    broke: 'You have run out of money.',
    paytable: 'Paytable (per €1 staked)',
    three: (s: string) => `${s} ${s} ${s}`,
    suits: 'Any three suits',
    twoSpades: '♠ ♠ on the first two reels',
    oneSpade: '♠ on the first reel',
    chart: 'Your money on each spin',
    stake: 'Stake: €1',
    machine: 'Three-reel slot machine',
  },
};

const START = 100;
const rng = () => {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] / 4294967296;
};

function Symbol({ s }: { s: Sym }) {
  if (!s) return <span className="sym blank" aria-label="—" />;
  const cls = s === '7' ? 'seven' : s === 'BAR' ? 'bar' : s === '♥' || s === '♦' ? 'red' : 'black';
  return <span className={`sym ${cls}`}>{s}</span>;
}

export default function Slot({ lang }: { lang: Lang }) {
  const t = T[lang];
  const f = fmt(lang);
  const [stops, setStops] = useState([0, 2, 4]);
  const [credit, setCredit] = useState(START);
  const [spins, setSpins] = useState(0);
  const [won, setWon] = useState(0);
  const [near, setNear] = useState(0);
  const [msg, setMsg] = useState<{ kind: 'win' | 'lose' | 'near'; text: string } | null>(null);
  const [path, setPath] = useState<{ x: number; y: number }[]>([{ x: 0, y: START }]);
  const [rolling, setRolling] = useState(false);
  const { rtp } = exactRTP();
  const anim = useRef<number | null>(null);

  const play = (n: number) => {
    let c = credit;
    let w = 0;
    let nm = 0;
    let s = spins;
    let last = stops;
    let lastPay = 0;
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i < n && c >= 1; i++) {
      const st = [0, 1, 2].map((r) => spinReel(r, rng()));
      const pay = payout(st.map((x) => STRIP[x]));
      c += pay - 1;
      w += pay;
      if (isNearMiss(st)) nm++;
      s++;
      last = st;
      lastPay = pay;
      if (n <= 1 || s % Math.max(1, Math.floor(n / 200)) === 0) pts.push({ x: s, y: c });
    }
    pts.push({ x: s, y: c });
    return { c, w, nm, s, last, lastPay, pts };
  };

  const commit = (r: ReturnType<typeof play>, single: boolean) => {
    setStops(r.last);
    setCredit(r.c);
    setWon((x) => x + r.w);
    setNear((x) => x + r.nm);
    setSpins(r.s);
    setPath((p) => {
      const next = [...p, ...r.pts];
      return next.length > 600 ? next.filter((_, i) => i % 2 === 0 || i === next.length - 1) : next;
    });
    if (single) {
      if (r.lastPay > 0) setMsg({ kind: 'win', text: t.win(f.eur(r.lastPay)) });
      else if (r.nm) setMsg({ kind: 'near', text: t.near });
      else setMsg({ kind: 'lose', text: t.lose });
    } else setMsg(null);
  };

  const spinOnce = () => {
    if (rolling || credit < 1) return;
    const r = play(1);
    setRolling(true);
    setMsg(null);
    let frame = 0;
    const tick = () => {
      frame++;
      setStops([0, 1, 2].map((reel) => (frame > 10 + reel * 6 ? r.last[reel] : Math.floor(rng() * STRIP.length))));
      if (frame < 24) anim.current = window.setTimeout(tick, 55);
      else {
        commit(r, true);
        setRolling(false);
      }
    };
    tick();
  };

  const auto = (n: number) => {
    if (rolling || credit < 1) return;
    commit(play(n), false);
  };

  const reset = () => {
    if (anim.current) clearTimeout(anim.current);
    setRolling(false);
    setCredit(START);
    setSpins(0);
    setWon(0);
    setNear(0);
    setMsg(null);
    setPath([{ x: 0, y: START }]);
  };

  return (
    <div className="game slot">
      <div className="machine-col">
        <div className="machine" role="img" aria-label={t.machine}>
          <div className="reels">
            {stops.map((s, r) => (
              <div className="reel" key={r}>
                {window3(s).map((sym, i) => (
                  <div className={`cell ${i === 1 ? 'line' : 'off'}`} key={i}>
                    <Symbol s={sym} />
                  </div>
                ))}
              </div>
            ))}
            <div className="payline" aria-hidden="true" />
          </div>
          <div className={`slot-msg ${msg?.kind ?? ''}`} aria-live="polite">
            {msg?.text ?? t.stake}
          </div>
        </div>
        <div className="actions">
          <button type="button" className="btn" onClick={spinOnce} disabled={rolling || credit < 1}>
            {t.spin}
          </button>
          <button type="button" className="btn ghost" onClick={() => auto(100)} disabled={rolling || credit < 1}>
            {t.auto(100)}
          </button>
          <button type="button" className="btn ghost" onClick={() => auto(1000)} disabled={rolling || credit < 1}>
            {t.auto(1000)}
          </button>
          <button type="button" className="link" onClick={reset}>
            {t.reset}
          </button>
        </div>
      </div>

      <div className="panel">
        <dl className="scores">
          <div>
            <dt>{t.credit}</dt>
            <dd className={credit < START ? 'loss' : credit > START ? 'win' : ''}>{f.eur(credit)}</dd>
          </div>
          <div>
            <dt>{t.spins}</dt>
            <dd>{f.int(spins)}</dd>
          </div>
          <div>
            <dt>{t.won}</dt>
            <dd>{f.eur(won)}</dd>
          </div>
          <div>
            <dt title={t.nearNote}>{t.nearMiss}</dt>
            <dd>{f.int(near)}</dd>
          </div>
        </dl>
        {credit < 1 && <p className="loss">{t.broke}</p>}
        {path.length > 2 && (
          <>
            <p className="panel-label">{t.chart}</p>
            <LineChart
              series={[{ key: 'c', label: t.credit, color: 'var(--series-1)', points: path }]}
              height={180}
              zero={0}
              hLines={[{ y: START, label: f.eur(START) }]}
              xFormat={(x) => f.int(x)}
              yFormat={(y) => f.eur(y)}
              tooltipX={(x) => `${t.spins}: ${f.int(x)}`}
              ariaLabel={t.chart}
            />
          </>
        )}
        <p className="panel-label">{t.paytable}</p>
        <table className="paytable">
          <tbody>
            {Object.entries(PAYTABLE.three).map(([s, v]) => (
              <tr key={s}>
                <th scope="row">{t.three(s)}</th>
                <td className="num">{f.eur(v)}</td>
              </tr>
            ))}
            <tr>
              <th scope="row">{t.suits}</th>
              <td className="num">{f.eur(PAYTABLE.anySuits)}</td>
            </tr>
            <tr>
              <th scope="row">{t.twoSpades}</th>
              <td className="num">{f.eur(PAYTABLE.twoSpades)}</td>
            </tr>
            <tr>
              <th scope="row">{t.oneSpade}</th>
              <td className="num">{f.eur(PAYTABLE.oneSpade)}</td>
            </tr>
          </tbody>
        </table>
        <p className="figure-foot">
          {t.rtpLabel}: <strong className="num">{f.pct(rtp, 2)}</strong>
        </p>
      </div>
    </div>
  );
}
