import LineChart from '../../charts/LineChart';
import BarChart from '../../charts/BarChart';
import Calibration from '../../charts/Calibration';
import { DataTable } from '../../charts/core';
import { fmt, ui, type Lang } from '../../i18n';
import bySeason from '../../data/odds/margins-by-season.json';
import byLeague from '../../data/odds/margins-by-league.json';
import calibration from '../../data/odds/calibration.json';
import flb from '../../data/odds/favourite-longshot.json';
import strategies from '../../data/odds/strategies.json';

const L = {
  es: {
    season: 'Temporada',
    reference: 'Casa de referencia (Bet365)',
    best: 'Mejor cuota entre ~17 casas',
    arb: 'Partidos con «arbitraje» aparente',
    league: 'Liga',
    margin: 'Margen mediano',
    matches: 'Partidos',
    predicted: 'Probabilidad implícita',
    observed: 'Frecuencia real',
    perfect: 'Calibración perfecta',
    n: 'resultados',
    under: 'favoritos: ocurren más de lo que dicen las cuotas',
    over: '',
    oddsRange: 'Cuotas',
    roi: 'Retorno medio por apuesta',
    bets: 'Apuestas',
    strategy: 'Estrategia',
    winRate: 'Aciertos',
    pnl: 'Beneficio acumulado (unidades)',
    date: 'Fecha',
    strategies: {
      home: 'Siempre al local',
      draw: 'Siempre al empate',
      away: 'Siempre al visitante',
      favourite: 'Siempre al favorito',
      underdog: 'Siempre a la sorpresa',
      random: 'Al azar',
      favouriteBest: 'Favorito, a la mejor cuota',
      eloValue: 'Modelo Elo: «apuestas de valor»',
    } as Record<string, string>,
    betN: 'Apuesta nº',
  },
  en: {
    season: 'Season',
    reference: 'Reference bookmaker (Bet365)',
    best: 'Best price across ~17 books',
    arb: 'Matches with apparent “arbitrage”',
    league: 'League',
    margin: 'Median margin',
    matches: 'Matches',
    predicted: 'Implied probability',
    observed: 'Actual frequency',
    perfect: 'Perfect calibration',
    n: 'outcomes',
    under: 'favourites: win more often than the odds say',
    over: '',
    oddsRange: 'Odds',
    roi: 'Average return per bet',
    bets: 'Bets',
    strategy: 'Strategy',
    winRate: 'Win rate',
    pnl: 'Cumulative profit (units)',
    date: 'Date',
    strategies: {
      home: 'Always the home team',
      draw: 'Always the draw',
      away: 'Always the away team',
      favourite: 'Always the favourite',
      underdog: 'Always the underdog',
      random: 'At random',
      favouriteBest: 'Favourite, at the best price',
      eloValue: 'Elo model “value bets”',
    } as Record<string, string>,
    betN: 'Bet no.',
  },
};

const seasonLabel = (s: number) => `${String(s).slice(2)}/${String(s + 1).slice(2)}`;

export function MarginTrend({ lang }: { lang: Lang }) {
  const t = L[lang];
  const f = fmt(lang);
  const u = ui[lang];
  const ref = bySeason.map((d) => ({ x: d.season, y: d.margin }));
  const best = bySeason.filter((d) => d.bestMargin !== null).map((d) => ({ x: d.season, y: d.bestMargin as number }));
  return (
    <>
      <LineChart
        series={[
          { key: 'ref', label: t.reference, color: 'var(--series-2)', points: ref, endLabel: 'Bet365' },
          { key: 'best', label: t.best, color: 'var(--series-1)', points: best, endLabel: lang === 'es' ? 'Mejor cuota' : 'Best price' },
        ]}
        height={320}
        zero={0}
        yDomain={[0, 0.14]}
        xFormat={(x) => seasonLabel(x)}
        yFormat={(y) => f.pct(y, 0)}
        tooltipY={(y) => f.pct(y, 1)}
        ariaLabel={t.reference}
      />
      <DataTable
        caption={t.reference}
        showLabel={u.table.show}
        hideLabel={u.table.hide}
        columns={[t.season, t.reference, t.best, t.arb, t.matches]}
        rows={bySeason.map((d) => [seasonLabel(d.season), f.pct(d.margin, 1), d.bestMargin === null ? '—' : f.pct(d.bestMargin, 1), d.arbShare === null ? '—' : f.pct(d.arbShare, 0), f.int(d.n)])}
      />
    </>
  );
}

const FEATURED = ['E0', 'D1', 'SP1', 'I1', 'F1', 'E1', 'N1', 'USA', 'BRA', 'P1', 'SP2', 'T1', 'MEX', 'G1', 'EC', 'SC3'];

export function LeagueMargins({ lang }: { lang: Lang }) {
  const t = L[lang];
  const f = fmt(lang);
  const u = ui[lang];
  const rows = byLeague.filter((d) => FEATURED.includes(d.code));
  return (
    <>
      <BarChart
        rows={rows.map((d) => ({ category: d.name, values: { m: { v: d.margin, note: `${f.int(d.n)} ${t.matches.toLowerCase()}` } } }))}
        series={[{ key: 'm', label: t.margin, color: 'var(--series-2)' }]}
        format={(v) => f.pct(v, 1)}
        labelWidth={150}
        barHeight={16}
        ariaLabel={t.margin}
      />
      <DataTable
        caption={t.margin}
        showLabel={u.table.show}
        hideLabel={u.table.hide}
        columns={[t.league, t.margin, t.matches]}
        rows={byLeague.map((d) => [d.name, f.pct(d.margin, 1), f.int(d.n)])}
      />
    </>
  );
}

export function CalibrationFig({ lang }: { lang: Lang }) {
  const t = L[lang];
  const f = fmt(lang);
  const u = ui[lang];
  return (
    <>
      <Calibration
        points={calibration}
        pct={(v) => f.pct(v, 0)}
        int={f.int}
        labels={{ x: t.predicted, y: t.observed, perfect: t.perfect, observed: t.observed, n: t.n, under: '', over: '' }}
        ariaLabel={t.observed}
      />
      <DataTable
        caption={t.observed}
        showLabel={u.table.show}
        hideLabel={u.table.hide}
        columns={[t.predicted, t.observed, '95%', t.n]}
        rows={calibration.map((d) => [f.pct(d.predicted, 1), f.pct(d.observed, 1), `${f.pct(d.lo, 1)} – ${f.pct(d.hi, 1)}`, f.int(d.n)])}
      />
    </>
  );
}

export function FavouriteLongshot({ lang }: { lang: Lang }) {
  const t = L[lang];
  const f = fmt(lang);
  const u = ui[lang];
  const label = (d: { from: number; to: number | null }) => (d.to === null ? `≥ ${f.num(d.from, 0)}` : `${f.num(d.from, 2)}–${f.num(d.to, 2)}`);
  const cats = Array.from(new Set(flb.filter((d) => d.to !== null).map((d) => label(d))));
  const rows = cats.map((c) => {
    const ref = flb.find((d) => d.book === 'reference' && label(d) === c);
    const best = flb.find((d) => d.book === 'best' && label(d) === c);
    return {
      category: c,
      values: {
        ref: ref && { v: ref.roi, lo: ref.lo, hi: ref.hi, note: `${f.int(ref.n)} ${t.bets.toLowerCase()}` },
        best: best && { v: best.roi, lo: best.lo, hi: best.hi, note: `${f.int(best.n)} ${t.bets.toLowerCase()}` },
      },
    };
  });
  return (
    <>
      <BarChart
        rows={rows}
        series={[
          { key: 'ref', label: t.reference, color: 'var(--series-2)' },
          { key: 'best', label: t.best, color: 'var(--series-1)' },
        ]}
        format={(v) => f.signedPct(v, 0)}
        labelWidth={90}
        barHeight={11}
        ariaLabel={t.roi}
      />
      <DataTable
        caption={t.roi}
        showLabel={u.table.show}
        hideLabel={u.table.hide}
        columns={[t.oddsRange, `${t.roi} · Bet365`, '95%', `${t.roi} · ${lang === 'es' ? 'mejor cuota' : 'best price'}`, '95%', t.bets]}
        rows={rows.map((r) => [
          r.category,
          r.values.ref ? f.signedPct(r.values.ref.v, 1) : '—',
          r.values.ref ? `${f.signedPct(r.values.ref.lo!, 1)} … ${f.signedPct(r.values.ref.hi!, 1)}` : '—',
          r.values.best ? f.signedPct(r.values.best.v, 1) : '—',
          r.values.best ? `${f.signedPct(r.values.best.lo!, 1)} … ${f.signedPct(r.values.best.hi!, 1)}` : '—',
          r.values.ref ? f.int(flb.find((d) => d.book === 'reference' && label(d) === r.category)!.n) : '—',
        ])}
      />
    </>
  );
}

const STRAT_COLORS: Record<string, string> = {
  favourite: 'var(--series-1)',
  underdog: 'var(--series-2)',
  eloValue: 'var(--series-3)',
  favouriteBest: 'var(--series-4)',
};

export function Strategies({ lang }: { lang: Lang }) {
  const t = L[lang];
  const f = fmt(lang);
  const u = ui[lang];
  const shown = strategies.filter((s) => STRAT_COLORS[s.key]);
  const background = strategies.filter((s) => !STRAT_COLORS[s.key]);
  // put every strategy on a common 0..1 x axis (share of its bets placed)
  const toPts = (s: (typeof strategies)[number]) => s.series.map((p) => ({ x: p.i / s.bets, y: p.pnl / s.bets }));
  return (
    <>
      <LineChart
        series={[
          ...background.map((s) => ({ key: s.key, label: t.strategies[s.key], color: 'var(--series-muted)', texture: true, width: 1.5, points: toPts(s) })),
          ...shown.map((s) => ({ key: s.key, label: t.strategies[s.key], color: STRAT_COLORS[s.key], points: toPts(s), endLabel: f.signedPct(s.roi, 1) })),
        ]}
        height={360}
        zero={0}
        xDomain={[0, 1]}
        xFormat={(x) => f.pct(x, 0)}
        tooltipX={(x) => `${f.pct(x, 0)} ${lang === 'es' ? 'de las apuestas' : 'of the bets'}`}
        yFormat={(y) => f.signedPct(y, 0)}
        tooltipY={(y) => f.signedPct(y, 1)}
        rightPad={70}
        ariaLabel={t.pnl}
      />
      <DataTable
        caption={t.strategy}
        showLabel={u.table.show}
        hideLabel={u.table.hide}
        columns={[t.strategy, t.bets, t.winRate, t.roi, '95%']}
        rows={strategies.map((s) => [t.strategies[s.key], f.int(s.bets), f.pct(s.winRate, 1), f.signedPct(s.roi, 1), `${f.signedPct(s.roiLo, 1)} … ${f.signedPct(s.roiHi, 1)}`])}
      />
    </>
  );
}
