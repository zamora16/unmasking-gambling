import { useState } from 'react';
import { scaleLinear, scaleBand } from 'd3-scale';
import { useWidth, YAxis, Tooltip, Legend, niceTicks } from './core';

export interface ColSeries {
  key: string;
  label: string;
  color: string;
}
export interface ColDatum {
  label: string;
  values: Record<string, number>;
}

interface Props {
  data: ColDatum[];
  series: ColSeries[];
  stacked?: boolean;
  height?: number;
  format: (v: number) => string;
  tickFormat?: (v: number) => string;
  ariaLabel: string;
  maxBar?: number;
  xLabelEvery?: number;
  highlight?: (d: ColDatum, i: number) => boolean;
}

/** Vertical columns: single, grouped or stacked. 4px rounded caps, square at
 *  the baseline, 2px surface gap between stacked segments. */
export default function Columns({ data, series, stacked = false, height = 300, format, tickFormat = format, ariaLabel, maxBar = 36, xLabelEvery = 1, highlight }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const m = { top: 14, right: 8, bottom: 28, left: 40 };
  const iw = width - m.left - m.right;
  const ih = height - m.top - m.bottom;
  const totals = data.map((d) => (stacked ? series.reduce((s, k) => s + (d.values[k.key] ?? 0), 0) : Math.max(...series.map((k) => d.values[k.key] ?? 0))));
  const yt = niceTicks(0, Math.max(...totals) * 1.05, 4);
  const y = scaleLinear().domain([0, yt[yt.length - 1]]).range([ih, 0]);
  const x = scaleBand<number>().domain(data.map((_, i) => i)).range([0, iw]).paddingInner(0.25).paddingOuter(0.1);
  const groupW = Math.min(maxBar * (stacked ? 1 : series.length), x.bandwidth());
  const barW = stacked ? groupW : (groupW - (series.length - 1) * 2) / series.length;

  const capPath = (bx: number, top: number, w: number, bottom: number, round: boolean) => {
    const r = round ? Math.min(4, w / 2, (bottom - top) / 2) : 0;
    return `M${bx},${bottom} V${top + r} Q${bx},${top} ${bx + r},${top} H${bx + w - r} Q${bx + w},${top} ${bx + w},${top + r} V${bottom} Z`;
  };

  return (
    <div className="ug-chart" ref={ref} style={{ position: 'relative' }}>
      {series.length > 1 && <Legend items={series.map((s) => ({ label: s.label, color: s.color, kind: 'rect' }))} />}
      <svg width={width} height={height} role="img" aria-label={ariaLabel}>
        <g transform={`translate(${m.left},${m.top})`}>
          <YAxis ticks={yt.map((v) => ({ value: v, label: tickFormat(v) }))} scale={y} width={iw} zero={0} x={-m.left} />
          {data.map((d, i) => {
            const gx = (x(i) ?? 0) + (x.bandwidth() - groupW) / 2;
            let acc = 0;
            const dim = hover !== null && hover !== i;
            const hl = highlight ? highlight(d, i) : true;
            return (
              <g key={d.label} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)} tabIndex={0} onFocus={() => setHover(i)} onBlur={() => setHover(null)} opacity={dim ? 0.55 : 1}>
                <rect x={x(i)} y={0} width={x.bandwidth()} height={ih} fill="transparent" />
                {series.map((s, j) => {
                  const v = d.values[s.key] ?? 0;
                  if (stacked) {
                    const bottom = y(acc);
                    acc += v;
                    const top = y(acc);
                    const isTop = j === series.length - 1;
                    const h = bottom - top - (j > 0 ? 2 : 0);
                    return h > 0 ? <path key={s.key} d={capPath(gx, top, barW, top + h, isTop)} fill={s.color} fillOpacity={hl ? 1 : 0.45} /> : null;
                  }
                  const bx = gx + j * (barW + 2);
                  return <path key={s.key} d={capPath(bx, y(v), barW, ih, true)} fill={s.color} fillOpacity={hl ? 1 : 0.45} />;
                })}
                {(i % xLabelEvery === 0 || i === data.length - 1) && (
                  <text x={(x(i) ?? 0) + x.bandwidth() / 2} y={ih + 18} textAnchor="middle" fontSize={11.5} fill="var(--ink-3)">
                    {d.label}
                  </text>
                )}
              </g>
            );
          })}
        </g>
      </svg>
      {hover !== null && (
        <Tooltip x={(x(hover) ?? 0) + x.bandwidth() / 2 + m.left} y={m.top + 10} width={width}>
          <div className="tt-x">{data[hover].label}</div>
          {[...series].reverse().map((s) => (
            <div className="tt-row" key={s.key}>
              <span className="tt-key" style={{ background: s.color }} />
              <strong>{format(data[hover].values[s.key] ?? 0)}</strong>
              <span>{s.label}</span>
            </div>
          ))}
          {stacked && series.length > 1 && <div className="tt-note">Total: {format(totals[hover])}</div>}
        </Tooltip>
      )}
    </div>
  );
}
