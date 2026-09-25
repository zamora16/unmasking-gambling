import { useEffect, useMemo, useRef, useState } from 'react';
import LineChart from '../charts/LineChart';
import Columns from '../charts/Columns';
import { DataTable, Dual } from '../charts/core';
import type { RuinResult, Strategy } from '../lib/montecarlo';
import { GAMES, houseEdge, type GameId } from '../lib/games';
import { fmt, type Lang } from '../i18n';

const T = {
  es: {
    controls: 'Reglas del experimento',
    game: 'Juego',
    games: {
      rouletteRed: 'Ruleta europea · al rojo',
      rouletteNumber: 'Ruleta europea · a un número',
      rouletteAmerican: 'Ruleta americana · al rojo',
      slotLow: 'Tragaperras · volatilidad baja (RTP 96 %)',
      slotHigh: 'Tragaperras · volatilidad alta (RTP 96 %)',
      sportsBet: 'Apuesta deportiva a cuota 2,00 (margen 6,5 %)',
      fairCoin: 'Moneda justa (sin ventaja de la casa)',
    } as Record<GameId, string>,
    bankroll: 'Dinero inicial',
    stake: 'Apuesta base',
    rounds: 'Apuestas por jugador',
    strategy: 'Estrategia',
    strategies: { flat: 'Apuesta fija', martingale: 'Martingala (doblar tras perder)', dalembert: "D'Alembert (+1 tras perder)" } as Record<Strategy, string>,
    target: 'Retirarse al doblar el dinero',
    players: 'Jugadores simulados',
    run: 'Volver a simular',
    presets: 'Escenarios',
    presetList: [
      { key: 'evening', label: 'Una tarde de ruleta' },
      { key: 'slots', label: 'Tragaperras explosiva' },
      { key: 'martingale', label: 'El sistema infalible' },
      { key: 'fair', label: 'Sin ventaja de la casa' },
    ],
    edge: 'Ventaja de la casa',
    edgePlain: (x: string) => `De cada 100 € apostados, la casa se queda ${x} de media.`,
    ruined: 'Se arruinaron',
    ahead: 'Terminaron ganando',
    median: 'Resultado mediano',
    avgLoss: 'Pérdida media',
    expected: 'predicha por la ventaja',
    fanTitle: 'Cómo evoluciona el dinero de todos los jugadores',
    fanSub: (n: string) => `Cada línea fina es una persona. La zona azul oscura es donde está la mitad de los ${n} jugadores; la clara, casi todos. Si la zona baja, la gente está perdiendo dinero.`,
    fanSubTech: (n: string) => `Bandas de percentiles P25–P75 y P5–P95 de ${n} trayectorias, con la mediana y la media. Las líneas finas son trayectorias individuales.`,
    median50: 'Jugador mediano',
    meanLine: 'Media de todos',
    band50: '50 % central',
    band90: '90 % central',
    start: 'Dinero inicial',
    after: 'tras',
    bets: 'apuestas',
    survTitle: 'Cuántos siguen teniendo dinero',
    survSub: 'Qué parte de los jugadores sigue teniendo dinero para apostar a medida que pasan las apuestas.',
    survSubTech: 'Curva de supervivencia de Kaplan–Meier. Quien se retira al doblar su dinero sale del grupo sin contar como arruinado (dato censurado).',
    stillIn: 'Sin arruinarse',
    histTitle: 'Con cuánto dinero acaba cada jugador',
    histSub: 'Cuántas personas acaban con cada cantidad. La barra de la izquierda son quienes se quedaron sin nada; en oscuro, quienes acabaron ganando.',
    histSubTech: 'Histograma del bankroll final (40 intervalos). La primera barra acumula la ruina; en oscuro, los intervalos por encima del bankroll inicial.',
    players2: 'jugadores',
    headline: (r: RuinResult, f: ReturnType<typeof fmt>, n: number) =>
      `De ${f.int(n)} jugadores, ${f.pct(r.ruinedShare, 0)} se quedó sin dinero y solo ${f.pct(r.aheadShare, 0)} terminó por encima de lo que tenía. En conjunto apostaron ${f.eur(r.totalWagered)} y perdieron de media ${f.eur(r.expectedLossFromEdge, 2)} por cabeza: casi exactamente lo que dice la ventaja de la casa.`,
    fair: 'Con una moneda justa nadie tiene ventaja: la media se queda plana, pero la varianza sigue arruinando a una parte de los jugadores.',
    table: { show: 'Ver los datos en tabla', hide: 'Ocultar tabla' },
    computing: 'Simulando…',
    ms: (ms: number, draws: string) => `${draws} tiradas simuladas en ${Math.round(ms)} ms en tu navegador.`,
    round: 'Apuesta nº',
  },
  en: {
    controls: 'Rules of the experiment',
    game: 'Game',
    games: {
      rouletteRed: 'European roulette · on red',
      rouletteNumber: 'European roulette · on a single number',
      rouletteAmerican: 'American roulette · on red',
      slotLow: 'Slot machine · low volatility (96% RTP)',
      slotHigh: 'Slot machine · high volatility (96% RTP)',
      sportsBet: 'Sports bet at odds of 2.00 (6.5% margin)',
      fairCoin: 'Fair coin (no house edge)',
    } as Record<GameId, string>,
    bankroll: 'Starting money',
    stake: 'Base stake',
    rounds: 'Bets per player',
    strategy: 'Strategy',
    strategies: { flat: 'Flat stake', martingale: 'Martingale (double after a loss)', dalembert: "D'Alembert (+1 after a loss)" } as Record<Strategy, string>,
    target: 'Walk away after doubling the money',
    players: 'Simulated players',
    run: 'Run again',
    presets: 'Scenarios',
    presetList: [
      { key: 'evening', label: 'An evening at roulette' },
      { key: 'slots', label: 'High-volatility slots' },
      { key: 'martingale', label: 'The “sure-fire” system' },
      { key: 'fair', label: 'No house edge' },
    ],
    edge: 'House edge',
    edgePlain: (x: string) => `Of every €100 wagered, the house keeps ${x} on average.`,
    ruined: 'Went broke',
    ahead: 'Finished ahead',
    median: 'Median outcome',
    avgLoss: 'Average loss',
    expected: 'predicted by the edge',
    fanTitle: 'How everyone’s money evolves',
    fanSub: (n: string) => `Each thin line is one person. The dark blue area is where half of the ${n} players are; the light one, almost all of them. If the area goes down, people are losing money.`,
    fanSubTech: (n: string) => `P25–P75 and P5–P95 percentile bands over ${n} trajectories, with median and mean. Thin lines are individual trajectories.`,
    median50: 'Median player',
    meanLine: 'Average of all',
    band50: 'Middle 50%',
    band90: 'Middle 90%',
    start: 'Starting money',
    after: 'after',
    bets: 'bets',
    survTitle: 'How many still have money left',
    survSub: 'The share of players who still have money to bet as the bets go by.',
    survSubTech: 'Kaplan–Meier survival curve. Players who walk away after doubling their money leave the group without counting as broke (censored).',
    stillIn: 'Not broke',
    histTitle: 'How much money each player ends with',
    histSub: 'How many people end with each amount. The leftmost bar is those left with nothing; darker bars are those who ended up winning.',
    histSubTech: 'Histogram of final bankrolls (40 bins). The first bin holds the ruined players; darker bins are above the starting bankroll.',
    players2: 'players',
    headline: (r: RuinResult, f: ReturnType<typeof fmt>, n: number) =>
      `Out of ${f.int(n)} players, ${f.pct(r.ruinedShare, 0)} ran out of money and only ${f.pct(r.aheadShare, 0)} finished above where they started. Together they wagered ${f.eur(r.totalWagered)} and lost ${f.eur(r.expectedLossFromEdge, 2)} each on average: almost exactly what the house edge predicts.`,
    fair: 'With a fair coin nobody has an edge: the average stays flat, yet variance still ruins some of the players.',
    table: { show: 'Show the data as a table', hide: 'Hide table' },
    computing: 'Simulating…',
    ms: (ms: number, draws: string) => `${draws} rounds simulated in ${Math.round(ms)} ms in your browser.`,
    round: 'Bet no.',
  },
};

interface Params {
  gameId: GameId;
  bankroll: number;
  stake: number;
  rounds: number;
  strategy: Strategy;
  target: boolean;
  players: number;
  seed: number;
}

const PRESETS: Record<string, Omit<Params, 'seed'>> = {
  evening: { gameId: 'rouletteRed', bankroll: 100, stake: 5, rounds: 200, strategy: 'flat', target: false, players: 5000 },
  slots: { gameId: 'slotHigh', bankroll: 100, stake: 1, rounds: 1000, strategy: 'flat', target: false, players: 5000 },
  martingale: { gameId: 'rouletteRed', bankroll: 200, stake: 1, rounds: 500, strategy: 'martingale', target: false, players: 5000 },
  fair: { gameId: 'fairCoin', bankroll: 100, stake: 5, rounds: 500, strategy: 'flat', target: false, players: 5000 },
};

export default function RuinLab({ lang }: { lang: Lang }) {
  const t = T[lang];
  const f = fmt(lang);
  const [p, setP] = useState<Params>({ ...PRESETS.evening, seed: 7 });
  const [result, setResult] = useState<RuinResult | null>(null);
  const [ms, setMs] = useState(0);
  const [busy, setBusy] = useState(false);
  const [preset, setPreset] = useState('evening');
  const worker = useRef<Worker | null>(null);
  const reqId = useRef(0);

  useEffect(() => {
    const w = new Worker(new URL('../workers/ruin.worker.ts', import.meta.url), { type: 'module' });
    w.onmessage = (e) => {
      if (e.data.id !== reqId.current) return;
      setResult(e.data.result);
      setMs(e.data.ms);
      setBusy(false);
    };
    worker.current = w;
    return () => w.terminate();
  }, []);

  useEffect(() => {
    if (!worker.current) return;
    setBusy(true);
    const id = ++reqId.current;
    const h = setTimeout(() => {
      worker.current?.postMessage({
        id,
        gameId: p.gameId,
        players: p.players,
        rounds: p.rounds,
        bankroll: p.bankroll,
        stake: p.stake,
        strategy: p.strategy,
        target: p.target ? p.bankroll * 2 : 0,
        maxStake: p.strategy === 'flat' ? p.stake : Math.max(p.stake * 500, 500),
        seed: p.seed,
      });
    }, 120);
    return () => clearTimeout(h);
  }, [p, worker.current]);

  const set = <K extends keyof Params>(k: K, v: Params[K]) => {
    setPreset('');
    setP((q) => ({ ...q, [k]: v }));
  };
  const edge = houseEdge(GAMES[p.gameId]);

  const charts = useMemo(() => {
    if (!result) return null;
    const cps = result.checkpoints;
    const bands = result.bands;
    const fan = {
      series: [
        ...result.samplePaths.map((path, i) => ({
          key: `path${i}`,
          label: '',
          color: 'var(--series-muted)',
          texture: true,
          opacity: 0.4,
          points: path.map((y, j) => ({ x: cps[j], y })),
        })),
        { key: 'median', label: t.median50, color: 'var(--series-1)', points: bands.map((b, j) => ({ x: cps[j], y: b.p50 })), endLabel: t.median50 },
        { key: 'mean', label: t.meanLine, color: 'var(--ink)', dash: true, points: bands.map((b, j) => ({ x: cps[j], y: b.mean })), endLabel: t.meanLine },
      ],
      bands: [
        { key: 'b90', label: t.band90, color: 'var(--band-outer)', points: bands.map((b, j) => ({ x: cps[j], lo: b.p05, hi: b.p95 })) },
        { key: 'b50', label: t.band50, color: 'var(--band-inner)', points: bands.map((b, j) => ({ x: cps[j], lo: b.p25, hi: b.p75 })) },
      ],
    };
    const surv = result.survival;
    const survPts = [...surv.map((s) => ({ x: s.t, y: s.s })), { x: p.rounds, y: surv[surv.length - 1].s }];
    const hist = result.finalHistogram.map((b) => ({ label: f.eur(b.x0), values: { n: b.count }, x0: b.x0 }));
    return { fan, survPts, hist };
  }, [result, lang]);

  return (
    <div className="lab">
      <aside className="controls" aria-label={t.controls}>
        <p className="kicker">{t.presets}</p>
        <div className="presets" role="group" aria-label={t.presets}>
          {t.presetList.map((pr) => (
            <button
              key={pr.key}
              type="button"
              className={preset === pr.key ? 'on' : ''}
              aria-pressed={preset === pr.key}
              onClick={() => {
                setPreset(pr.key);
                setP((q) => ({ ...PRESETS[pr.key], seed: q.seed }));
              }}
            >
              {pr.label}
            </button>
          ))}
        </div>

        <p className="kicker">{t.controls}</p>
        <label className="field">
          <span>{t.game}</span>
          <select value={p.gameId} onChange={(e) => set('gameId', e.target.value as GameId)}>
            {(Object.keys(t.games) as GameId[]).map((g) => (
              <option key={g} value={g}>
                {t.games[g]}
              </option>
            ))}
          </select>
        </label>
        <Range label={t.bankroll} value={p.bankroll} min={20} max={1000} step={10} display={f.eur(p.bankroll)} onChange={(v) => set('bankroll', v)} />
        <Range label={t.stake} value={p.stake} min={1} max={50} step={1} display={f.eur(p.stake)} onChange={(v) => set('stake', v)} />
        <Range label={t.rounds} value={p.rounds} min={50} max={5000} step={50} display={f.int(p.rounds)} onChange={(v) => set('rounds', v)} />
        <label className="field">
          <span>{t.strategy}</span>
          <select value={p.strategy} onChange={(e) => set('strategy', e.target.value as Strategy)}>
            {(Object.keys(t.strategies) as Strategy[]).map((s) => (
              <option key={s} value={s}>
                {t.strategies[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="check">
          <input type="checkbox" checked={p.target} onChange={(e) => set('target', e.target.checked)} />
          <span>{t.target}</span>
        </label>
        <label className="field">
          <span>{t.players}</span>
          <select value={p.players} onChange={(e) => set('players', Number(e.target.value))}>
            {[1000, 5000, 20000].map((n) => (
              <option key={n} value={n}>
                {f.int(n)}
              </option>
            ))}
          </select>
        </label>
        <button type="button" className="btn run" onClick={() => setP((q) => ({ ...q, seed: q.seed + 1 }))}>
          ↻ {t.run}
        </button>
        <p className="edge">
          {t.edge}: <strong className="num">{f.pct(edge, 2)}</strong>
          <br />
          <span>{t.edgePlain(f.eur(edge * 100, 2))}</span>
        </p>
      </aside>

      <section className="results" aria-live="polite" aria-busy={busy} style={{ opacity: busy && result ? 0.6 : 1 }}>
        {!result ? (
          <p className="loading">{t.computing}</p>
        ) : (
          <>
            <p className="headline">{p.gameId === 'fairCoin' ? t.fair : t.headline(result, f, p.players)}</p>
            <div className="tiles">
              <Tile label={t.ruined} value={f.pct(result.ruinedShare, 0)} />
              <Tile label={t.ahead} value={f.pct(result.aheadShare, 0)} />
              <Tile label={t.median} value={f.eur(result.medianFinal - p.bankroll)} sub={`${t.start}: ${f.eur(p.bankroll)}`} />
              <Tile label={t.avgLoss} value={f.eur(p.bankroll - result.meanFinal, 2)} sub={`${f.eur(result.expectedLossFromEdge, 2)} ${t.expected}`} />
            </div>

            <figure className="figure">
              <figcaption className="figure-head">
                <p className="figure-title">{t.fanTitle}</p>
                <p className="figure-sub"><Dual simple={t.fanSub(f.int(p.players))} tech={t.fanSubTech(f.int(p.players))} /></p>
              </figcaption>
              {charts && (
                <LineChart
                  series={charts.fan.series}
                  bands={charts.fan.bands}
                  height={380}
                  xFormat={(x) => f.int(x)}
                  yFormat={(y) => f.eur(y)}
                  tooltipX={(x) => `${t.round} ${f.int(x)}`}
                  hLines={[{ y: p.bankroll, label: t.start }]}
                  zero={0}
                  yDomain={[0, Math.max(p.bankroll * 2.2, ...result.bands.map((b) => b.p95))]}
                  ariaLabel={t.fanTitle}
                />
              )}
              <DataTable
                caption={t.fanTitle}
                showLabel={t.table.show}
                hideLabel={t.table.hide}
                columns={[t.round, 'P5', 'P25', t.median50, 'P75', 'P95', t.meanLine]}
                rows={result.checkpoints
                  .filter((_, i) => i % 10 === 0 || i === result.checkpoints.length - 1)
                  .map((c) => {
                    const b = result.bands[result.checkpoints.indexOf(c)];
                    return [f.int(c), f.eur(b.p05), f.eur(b.p25), f.eur(b.p50), f.eur(b.p75), f.eur(b.p95), f.eur(b.mean, 2)];
                  })}
              />
            </figure>

            <div className="two">
              <figure className="figure">
                <figcaption className="figure-head">
                  <p className="figure-title">{t.survTitle}</p>
                  <p className="figure-sub"><Dual simple={t.survSub} tech={t.survSubTech} /></p>
                </figcaption>
                {charts && (
                  <LineChart
                    series={[{ key: 'km', label: t.stillIn, color: 'var(--series-1)', curve: 'step', points: charts.survPts }]}
                    height={260}
                    xDomain={[0, p.rounds]}
                    yDomain={[0, 1]}
                    xFormat={(x) => f.int(x)}
                    yFormat={(y) => f.pct(y, 0)}
                    tooltipX={(x) => `${t.round} ${f.int(x)}`}
                    ariaLabel={t.survTitle}
                  />
                )}
              </figure>
              <figure className="figure">
                <figcaption className="figure-head">
                  <p className="figure-title">{t.histTitle}</p>
                  <p className="figure-sub"><Dual simple={t.histSub} tech={t.histSubTech} /></p>
                </figcaption>
                {charts && (
                  <Columns
                    data={charts.hist}
                    series={[{ key: 'n', label: t.players2, color: 'var(--series-1)' }]}
                    height={260}
                    format={(v) => `${f.int(v)} ${t.players2}`}
                    tickFormat={(v) => f.int(v)}
                    xLabelEvery={10}
                    highlight={(d) => (d as unknown as { x0: number }).x0 >= p.bankroll}
                    ariaLabel={t.histTitle}
                  />
                )}
              </figure>
            </div>
            <p className="figure-foot">{t.ms(ms, f.compact(result.totalRounds))}</p>
          </>
        )}
      </section>
    </div>
  );
}

function Range({ label, value, min, max, step, display, onChange }: { label: string; value: number; min: number; max: number; step: number; display: string; onChange: (v: number) => void }) {
  return (
    <label className="field">
      <span className="row">
        {label}
        <output className="num">{display}</output>
      </span>
      <input type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} />
    </label>
  );
}

function Tile({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="tile">
      <p className="tile-label">{label}</p>
      <p className="tile-value">{value}</p>
      {sub && <p className="tile-sub">{sub}</p>}
    </div>
  );
}
