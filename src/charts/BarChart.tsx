import { useState } from 'react';
import { scaleLinear, scaleBand } from 'd3-scale';
import { useWidth, Legend, Tooltip, niceTicks } from './core';

export interface BarSeries {
  key: string;
  label: string;
  color: string;
}
export interface BarRow {
  category: string;
  values: Record<string, { v: number; lo?: number; hi?: number; note?: string } | undefined>;
}

interface Props {
  rows: BarRow[];
  series: BarSeries[];
  format: (v: number) => string;
  ariaLabel: string;
  labelWidth?: number;
  domain?: [number, number];
  barHeight?: number;
}

/** Horizontal bars grouped by category, diverging from zero, with optional
 *  95% interval whiskers. Value labels sit at the bar tip. */
export default function BarChart({ rows, series, format, ariaLabel, labelWidth = 110, domain, barHeight = 14 }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<{ row: number; s: string; x: number; y: number } | null>(null);
  const gap = 2;
  const groupH = series.length * barHeight + (series.length - 1) * gap;
  const rowH = groupH + 16;
  const m = { top: 8, right: 30, bottom: 26, left: labelWidth };
  const iw = Math.max(40, width - m.left - m.right);
  const ih = rows.length * rowH;
  const vals = rows.flatMap((r) => series.flatMap((s) => { const d = r.values[s.key]; return d ? [d.v, d.lo ?? d.v, d.hi ?? d.v] : []; }));
  const raw0 = domain ?? [Math.min(0, ...vals), Math.max(0, ...vals)];
  const span0 = raw0[1] - raw0[0] || 1;
  // leave room for the value labels at the bar tips
  const d0: [number, number] = [raw0[0] < 0 ? raw0[0] - span0 * 0.13 : raw0[0], raw0[1] > 0 ? raw0[1] + span0 * 0.13 : raw0[1]];
  const ticks = niceTicks(d0[0], d0[1], Math.max(3, Math.floor(iw / 90)));
  const x = scaleLinear().domain(d0).range([0, iw]);
  const visTicks = ticks.filter((t) => t >= d0[0] && t <= d0[1]);
  const band = scaleBand<number>().domain(rows.map((_, i) => i)).range([0, ih]);
  const zero = x(0);

  return (
    <div className="ug-chart" ref={ref} style={{ position: 'relative' }}>
      {series.length > 1 && <Legend items={series.map((s) => ({ label: s.label, color: s.color, kind: 'rect' }))} />}
      <svg width={width} height={ih + m.top + m.bottom} role="img" aria-label={ariaLabel}>
        <g transform={`translate(${m.left},${m.top})`}>
          {visTicks.map((t) => (
            <g key={t} transform={`translate(${x(t)},0)`} aria-hidden="true">
              <line y1={0} y2={ih} stroke={t === 0 ? 'var(--rule-strong)' : 'var(--grid)'} shapeRendering="crispEdges" />
              <text y={ih + 18} textAnchor="middle" fontSize={11.5} fill="var(--ink-3)">
                {format(t)}
              </text>
            </g>
          ))}
          {rows.map((r, i) => {
            const y0 = (band(i) ?? 0) + (rowH - groupH) / 2;
            return (
              <g key={r.category}>
                <text x={-12} y={y0 + groupH / 2} dy="0.32em" textAnchor="end" fontSize={12.5} fill="var(--ink-2)">
                  {r.category}
                </text>
                {series.map((s, j) => {
                  const d = r.values[s.key];
                  if (!d) return null;
                  const by = y0 + j * (barHeight + gap);
                  const xv = x(d.v);
                  const left = Math.min(zero, xv);
                  const w = Math.max(1, Math.abs(xv - zero));
                  const neg = d.v < 0;
                  const rad = Math.min(4, w / 2);
                  // rounded at the data end, square at the baseline
                  const path = neg
                    ? `M${zero},${by} H${left + rad} Q${left},${by} ${left},${by + rad} V${by + barHeight - rad} Q${left},${by + barHeight} ${left + rad},${by + barHeight} H${zero} Z`
                    : `M${zero},${by} H${left + w - rad} Q${left + w},${by} ${left + w},${by + rad} V${by + barHeight - rad} Q${left + w},${by + barHeight} ${left + w - rad},${by + barHeight} H${zero} Z`;
                  const active = hover && hover.row === i && hover.s === s.key;
                  const tip = neg ? Math.min(xv, d.lo !== undefined ? x(d.lo) : xv) - 6 : Math.max(xv, d.hi !== undefined ? x(d.hi) : xv) + 6;
                  return (
                    <g
                      key={s.key}
                      onPointerEnter={() => setHover({ row: i, s: s.key, x: xv + m.left, y: by + m.top })}
                      onPointerLeave={() => setHover(null)}
                      tabIndex={0}
                      onFocus={() => setHover({ row: i, s: s.key, x: xv + m.left, y: by + m.top })}
                      onBlur={() => setHover(null)}
                    >
                      <rect x={0} y={by - 3} width={iw} height={barHeight + 6} fill="transparent" />
                      <path d={path} fill={s.color} opacity={hover && !active ? 0.55 : 1} />
                      {d.lo !== undefined && d.hi !== undefined && (
                        <g stroke="var(--ink)" strokeWidth={1.2} opacity={0.75}>
                          <line x1={x(d.lo)} x2={x(d.hi)} y1={by + barHeight / 2} y2={by + barHeight / 2} />
                          <line x1={x(d.lo)} x2={x(d.lo)} y1={by + 3} y2={by + barHeight - 3} />
                          <line x1={x(d.hi)} x2={x(d.hi)} y1={by + 3} y2={by + barHeight - 3} />
                        </g>
                      )}
                      <text x={tip} y={by + barHeight / 2} dy="0.32em" textAnchor={neg ? 'end' : 'start'} fontSize={11.5} fill="var(--ink-2)" className="num">
                        {format(d.v)}
                      </text>
                    </g>
                  );
                })}
              </g>
            );
          })}
        </g>
      </svg>
      {hover && (
        <Tooltip x={hover.x} y={hover.y} width={width}>
          {(() => {
            const r = rows[hover.row];
            const d = r.values[hover.s]!;
            const s = series.find((q) => q.key === hover.s)!;
            return (
              <>
                <div className="tt-x">{r.category}</div>
                <div className="tt-row">
                  <span className="tt-key" style={{ background: s.color }} />
                  <strong>{format(d.v)}</strong>
                  <span>{s.label}</span>
                </div>
                {d.lo !== undefined && (
                  <div className="tt-note">
                    95%: {format(d.lo)} … {format(d.hi!)}
                  </div>
                )}
                {d.note && <div className="tt-note">{d.note}</div>}
              </>
            );
          })()}
        </Tooltip>
      )}
    </div>
  );
}
