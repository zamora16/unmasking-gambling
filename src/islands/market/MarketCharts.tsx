import LineChart from '../../charts/LineChart';
import Columns from '../../charts/Columns';
import BarChart from '../../charts/BarChart';
import { DataTable } from '../../charts/core';
import { fmt, ui, type Lang } from '../../i18n';
import d from '../../data/market/spain.json';

const L = {
  es: {
    year: 'Año',
    ggr: 'Pérdida de los jugadores (GGR)',
    wagered: 'Cantidades jugadas',
    hold: 'Parte que se queda la casa (GGR / jugado)',
    bonuses: 'Bonos liberados',
    casino: 'Casino',
    betting: 'Apuestas',
    poker: 'Póquer',
    bingo: 'Bingo',
    promotions: 'Promociones y bonos',
    advertising: 'Publicidad',
    affiliates: 'Afiliación',
    sponsorship: 'Patrocinio',
    boys: 'Chicos',
    girls: 'Chicas',
    total: 'Total',
    online: 'Online',
    inPerson: 'Presencial',
    adults: 'Población de 15 a 64 años, online',
    rd958: 'RD 958/2020',
    sts: 'Sentencia TS',
    m: 'M€',
  },
  en: {
    year: 'Year',
    ggr: 'Players’ losses (GGR)',
    wagered: 'Amounts wagered',
    hold: 'Share kept by the house (GGR / wagered)',
    bonuses: 'Bonuses released',
    casino: 'Casino',
    betting: 'Betting',
    poker: 'Poker',
    bingo: 'Bingo',
    promotions: 'Promotions and bonuses',
    advertising: 'Advertising',
    affiliates: 'Affiliates',
    sponsorship: 'Sponsorship',
    boys: 'Boys',
    girls: 'Girls',
    total: 'All',
    online: 'Online',
    inPerson: 'In person',
    adults: 'Population aged 15–64, online',
    rd958: 'Royal Decree 958/2020',
    sts: 'Supreme Court ruling',
    m: '€m',
  },
};

const S = d.series;

export function GgrColumns({ lang }: { lang: Lang }) {
  const t = L[lang];
  const f = fmt(lang);
  const u = ui[lang];
  const money = (v: number) => `${f.int(v)} ${t.m}`;
  return (
    <>
      <Columns
        data={S.years.map((y, i) => ({ label: String(y), values: { ggr: S.ggr[i] } }))}
        series={[{ key: 'ggr', label: t.ggr, color: 'var(--series-1)' }]}
        format={money}
        tickFormat={(v) => f.int(v)}
        height={280}
        maxBar={40}
        ariaLabel={t.ggr}
      />
      <DataTable
        caption={t.ggr}
        showLabel={u.table.show}
        hideLabel={u.table.hide}
        columns={[t.year, `${t.ggr} (${t.m})`, `${t.wagered} (${t.m})`, t.hold, `${t.bonuses} (${t.m})`]}
        rows={S.years.map((y, i) => [y, f.int(S.ggr[i]), f.int(S.wagered[i]), f.pct(S.ggr[i] / S.wagered[i], 2), f.int(S.bonuses[i])])}
      />
    </>
  );
}

export function HoldLine({ lang }: { lang: Lang }) {
  const t = L[lang];
  const f = fmt(lang);
  return (
    <LineChart
      series={[{ key: 'hold', label: t.hold, color: 'var(--series-2)', points: S.years.map((y, i) => ({ x: y, y: S.ggr[i] / S.wagered[i] })) }]}
      height={220}
      yDomain={[0, 0.06]}
      zero={0}
      xFormat={(x) => String(x)}
      yFormat={(y) => f.pct(y, 0)}
      tooltipY={(y) => f.pct(y, 2)}
      ariaLabel={t.hold}
    />
  );
}

export function BonusLine({ lang }: { lang: Lang }) {
  const t = L[lang];
  const f = fmt(lang);
  return (
    <LineChart
      series={[{ key: 'bonus', label: t.bonuses, color: 'var(--series-1)', points: S.years.map((y, i) => ({ x: y, y: S.bonuses[i] })) }]}
      height={280}
      zero={0}
      yDomain={[0, 400]}
      xFormat={(x) => String(x)}
      yFormat={(y) => `${f.int(y)}`}
      tooltipY={(y) => `${f.int(y)} ${t.m}`}
      annotations={[
        { x: 2020 + 10 / 12, label: t.rd958 },
        { x: 2024 + 3 / 12, label: t.sts },
      ]}
      ariaLabel={t.bonuses}
    />
  );
}

export function Segments({ lang }: { lang: Lang }) {
  const t = L[lang];
  const f = fmt(lang);
  const u = ui[lang];
  const g = d.segments;
  const keys = ['casino', 'betting', 'poker', 'bingo'] as const;
  return (
    <>
      <BarChart
        rows={keys.map((k) => ({
          category: t[k],
          values: Object.fromEntries(g.years.map((y, i) => [String(y), { v: g[k][i] }])),
        }))}
        series={g.years.map((y, i) => ({ key: String(y), label: String(y), color: i === 0 ? 'var(--series-muted)' : 'var(--series-1)' }))}
        format={(v) => `${f.int(v)} ${t.m}`}
        labelWidth={80}
        ariaLabel={t.ggr}
      />
      <DataTable
        caption={t.ggr}
        showLabel={u.table.show}
        hideLabel={u.table.hide}
        columns={['', ...g.years.map(String), lang === 'es' ? 'Cambio' : 'Change']}
        rows={keys.map((k) => [t[k], ...g[k].map((v) => f.num(v, 2)), f.signedPct(g[k][1] / g[k][0] - 1, 1)])}
      />
    </>
  );
}

export function Marketing({ lang }: { lang: Lang }) {
  const t = L[lang];
  const f = fmt(lang);
  const u = ui[lang];
  const g = d.marketing;
  const keys = ['promotions', 'advertising', 'affiliates', 'sponsorship'] as const;
  return (
    <>
      <BarChart
        rows={keys.map((k) => ({ category: t[k], values: Object.fromEntries(g.years.map((y, i) => [String(y), { v: g[k][i] }])) }))}
        series={g.years.map((y, i) => ({ key: String(y), label: String(y), color: i === 0 ? 'var(--series-muted)' : 'var(--series-2)' }))}
        format={(v) => `${f.int(v)} ${t.m}`}
        labelWidth={150}
        ariaLabel={t.promotions}
      />
      <DataTable
        caption={t.promotions}
        showLabel={u.table.show}
        hideLabel={u.table.hide}
        columns={['', ...g.years.map(String), lang === 'es' ? 'Cambio' : 'Change']}
        rows={keys.map((k) => [t[k], ...g[k].map((v) => f.num(v, 2)), f.signedPct(g[k][1] / g[k][0] - 1, 1)])}
      />
    </>
  );
}

export function Prevalence({ lang }: { lang: Lang }) {
  const t = L[lang];
  const f = fmt(lang);
  const u = ui[lang];
  const st = d.prevalence.students;
  const pts = (ys: number[], vs: number[]) => ys.map((y, i) => ({ x: y, y: vs[i] / 100 }));
  return (
    <>
      <LineChart
        series={[
          { key: 'boys', label: `${t.online} · ${t.boys}`, color: 'var(--series-1)', points: pts(st.years, st.onlineBoys), endLabel: t.boys },
          { key: 'total', label: `${t.online} · ${t.total}`, color: 'var(--ink)', dash: true, points: pts(st.years, st.online), endLabel: t.total },
          { key: 'girls', label: `${t.online} · ${t.girls}`, color: 'var(--series-2)', points: pts(st.years, st.onlineGirls), endLabel: t.girls },
        ]}
        height={300}
        zero={0}
        yDomain={[0, 0.25]}
        xFormat={(x) => String(x)}
        xTicks={st.years.map((y) => ({ value: y, label: String(y) }))}
        yFormat={(y) => f.pct(y, 0)}
        tooltipY={(y) => f.pct(y, 1)}
        ariaLabel={t.online}
      />
      <DataTable
        caption={t.online}
        showLabel={u.table.show}
        hideLabel={u.table.hide}
        columns={[t.year, `${t.online} · ${t.total}`, `${t.online} · ${t.boys}`, `${t.online} · ${t.girls}`, t.inPerson]}
        rows={st.years.map((y, i) => [y, f.num(st.online[i], 1) + ' %', f.num(st.onlineBoys[i], 1) + ' %', f.num(st.onlineGirls[i], 1) + ' %', f.num(st.inPerson[i], 1) + ' %'])}
      />
    </>
  );
}

export function AdultsOnline({ lang }: { lang: Lang }) {
  const t = L[lang];
  const f = fmt(lang);
  const ad = d.prevalence.adults;
  return (
    <LineChart
      series={[{ key: 'adults', label: t.adults, color: 'var(--series-1)', points: ad.years.map((y, i) => ({ x: y, y: ad.online[i] / 100 })) }]}
      height={220}
      zero={0}
      yDomain={[0, 0.08]}
      xFormat={(x) => String(x)}
      xTicks={ad.years.map((y) => ({ value: y, label: String(y) }))}
      yFormat={(y) => f.pct(y, 0)}
      tooltipY={(y) => f.pct(y, 1)}
      ariaLabel={t.adults}
    />
  );
}
