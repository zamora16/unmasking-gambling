import { useState } from 'react';
import { scaleLinear } from 'd3-scale';
import { useWidth, YAxis, XAxis, Tooltip, Legend } from './core';

export interface CalPoint {
  predicted: number;
  observed: number;
  lo: number;
  hi: number;
  n: number;
}

interface Props {
  points: CalPoint[];
  compare?: { points: CalPoint[]; label: string };
  pct: (v: number) => string;
  int: (v: number) => string;
  labels: { x: string; y: string; perfect: string; observed: string; n: string; under: string; over: string };
  ariaLabel: string;
}

/** Reliability diagram: predicted probability vs observed frequency, with an
 *  optional second series drawn on top. */
export default function Calibration({ points, compare, pct, int, labels, ariaLabel }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<{ s: 0 | 1; i: number } | null>(null);
  const size = Math.min(width, 520);
  const m = { top: 12, right: 12, bottom: 44, left: 40 };
  const iw = size - m.left - m.right;
  const ih = size - m.top - m.bottom;
  const x = scaleLinear().domain([0, 1]).range([0, iw]);
  const y = scaleLinear().domain([0, 1]).range([ih, 0]);
  const ticks = [0, 0.2, 0.4, 0.6, 0.8, 1].map((v) => ({ value: v, label: pct(v) }));
  const sets = [
    { points, color: 'var(--series-1)', label: labels.observed },
    ...(compare ? [{ points: compare.points, color: 'var(--series-2)', label: compare.label }] : []),
  ];
  const hp = hover && sets[hover.s].points[hover.i];
  return (
    <div className="ug-chart" ref={ref} style={{ position: 'relative' }}>
      <Legend
        items={[
          ...sets.map((s) => ({ label: s.label, color: s.color, kind: 'line' as const })),
          { label: labels.perfect, color: 'var(--ink-3)', kind: 'dash' },
        ]}
      />
      <svg width={size} height={size} role="img" aria-label={ariaLabel} style={{ overflow: 'visible' }}>
        <g transform={`translate(${m.left},${m.top})`}>
          <YAxis ticks={ticks} scale={y} width={iw} x={-m.left} />
          <XAxis ticks={ticks} scale={x} y={ih} />
          <text x={iw} y={ih + 38} textAnchor="end" fontSize={11.5} fill="var(--ink-2)">
            {labels.x} →
          </text>
          <line x1={x(0)} y1={y(0)} x2={x(1)} y2={y(1)} stroke="var(--ink-3)" strokeDasharray="4 4" />
          <text x={x(0.66)} y={y(0.66) + 18} fontSize={11.5} fill="var(--ink-3)" transform={`rotate(${-Math.atan2(ih, iw) * 57.2958} ${x(0.66)} ${y(0.66) + 18})`}>
            {labels.perfect}
          </text>
          <text x={x(0.97)} y={y(0.1)} textAnchor="end" fontSize={11.5} fill="var(--ink-2)">
            {labels.under}
          </text>
          <text x={x(0.03)} y={y(0.9)} fontSize={11.5} fill="var(--ink-2)">
            {labels.over}
          </text>
          {sets.map((set, s) => (
            <g key={s}>
              <polyline points={set.points.map((p) => `${x(p.predicted)},${y(p.observed)}`).join(' ')} fill="none" stroke={set.color} strokeWidth={2} />
              {set.points.map((p, i) => {
                const on = () => setHover({ s: s as 0 | 1, i });
                const active = hover?.s === s && hover.i === i;
                return (
                  <g key={i} onPointerEnter={on} onPointerLeave={() => setHover(null)} tabIndex={0} onFocus={on} onBlur={() => setHover(null)}>
                    <line x1={x(p.predicted)} x2={x(p.predicted)} y1={y(p.lo)} y2={y(p.hi)} stroke={set.color} strokeWidth={1.5} />
                    <circle cx={x(p.predicted)} cy={y(p.observed)} r={active ? 6 : 4.5} fill={set.color} stroke="var(--paper)" strokeWidth={2} />
                    <circle cx={x(p.predicted)} cy={y(p.observed)} r={10} fill="transparent" />
                  </g>
                );
              })}
            </g>
          ))}
        </g>
      </svg>
      {hover && hp && (
        <Tooltip x={x(hp.predicted) + m.left} y={y(hp.observed) + m.top - 10} width={size}>
          <div className="tt-x">
            {labels.x}: {pct(hp.predicted)}
          </div>
          <div className="tt-row">
            <span className="tt-key" style={{ background: sets[hover.s].color }} />
            <strong>{pct(hp.observed)}</strong>
            <span>{sets.length > 1 ? sets[hover.s].label : labels.y}</span>
          </div>
          <div className="tt-note">
            95%: {pct(hp.lo)} – {pct(hp.hi)} · {labels.n}: {int(hp.n)}
          </div>
        </Tooltip>
      )}
    </div>
  );
}
