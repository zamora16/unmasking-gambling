import LineChart from '../charts/LineChart';
import { fmt, type Lang } from '../i18n';

interface Data {
  x: number[];
  p05: number[];
  p25: number[];
  p50: number[];
  p75: number[];
  p95: number[];
  mean: number[];
  paths: number[][];
}

export default function HeroChart({ lang, data, bankroll }: { lang: Lang; data: Data; bankroll: number }) {
  const f = fmt(lang);
  const es = lang === 'es';
  const pts = (ys: number[]) => ys.map((y, i) => ({ x: data.x[i], y }));
  return (
    <LineChart
      series={[
        ...data.paths.map((p, i) => ({ key: `p${i}`, label: '', color: 'var(--series-muted)', texture: true, opacity: 0.5, points: pts(p) })),
        { key: 'median', label: es ? 'Jugador mediano' : 'Median player', color: 'var(--series-1)', points: pts(data.p50), endLabel: es ? 'Mediana' : 'Median' },
        { key: 'mean', label: es ? 'Media' : 'Average', color: 'var(--ink)', dash: true, points: pts(data.mean), endLabel: es ? 'Media' : 'Average' },
      ]}
      bands={[
        { key: 'b90', label: es ? '90 % de los jugadores' : '90% of players', color: 'var(--band-outer)', points: data.x.map((x, i) => ({ x, lo: data.p05[i], hi: data.p95[i] })) },
        { key: 'b50', label: es ? '50 % central' : 'Middle 50%', color: 'var(--band-inner)', points: data.x.map((x, i) => ({ x, lo: data.p25[i], hi: data.p75[i] })) },
      ]}
      height={400}
      yDomain={[0, 200]}
      zero={0}
      hLines={[{ y: bankroll, label: es ? 'Dinero inicial' : 'Starting money' }]}
      xFormat={(x) => f.int(x)}
      tooltipX={(x) => `${es ? 'Apuesta nº' : 'Bet no.'} ${f.int(x)}`}
      yFormat={(y) => f.eur(y)}
      ariaLabel={es ? 'Evolución del dinero de 2.000 jugadores simulados en la ruleta' : 'Bankroll of 2,000 simulated roulette players over time'}
    />
  );
}
