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
  pct: (v: number) => string;
  int: (v: number) => string;
  labels: { x: string; y: string; perfect: string; observed: string; n: string; under: string; over: string };
  ariaLabel: string;
}

/** Reliability diagram: predicted probability vs observed frequency. */
export default function Calibration({ points, pct, int, labels, ariaLabel }: Props) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const size = Math.min(width, 520);
  const m = { top: 12, right: 12, bottom: 44, left: 40 };
  const iw = size - m.left - m.right;
  const ih = size - m.top - m.bottom;
  const x = scaleLinear().domain([0, 1]).range([0, iw]);
  const y = scaleLinear().domain([0, 1]).range([ih, 0]);
  const ticks = [0, 0.2, 0.4, 0.6, 0.8, 1].map((v) => ({ value: v, label: pct(v) }));
  return (
    <div className="ug-chart" ref={ref} style={{ position: 'relative' }}>
      <Legend
        items={[
          { label: labels.observed, color: 'var(--series-1)', kind: 'line' },
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
          <polyline points={points.map((p) => `${x(p.predicted)},${y(p.observed)}`).join(' ')} fill="none" stroke="var(--series-1)" strokeWidth={2} />
          {points.map((p, i) => (
            <g key={i} onPointerEnter={() => setHover(i)} onPointerLeave={() => setHover(null)} tabIndex={0} onFocus={() => setHover(i)} onBlur={() => setHover(null)}>
              <line x1={x(p.predicted)} x2={x(p.predicted)} y1={y(p.lo)} y2={y(p.hi)} stroke="var(--series-1)" strokeWidth={1.5} />
              <circle cx={x(p.predicted)} cy={y(p.observed)} r={hover === i ? 6 : 4.5} fill="var(--series-1)" stroke="var(--paper)" strokeWidth={2} />
              <circle cx={x(p.predicted)} cy={y(p.observed)} r={13} fill="transparent" />
            </g>
          ))}
        </g>
      </svg>
      {hover !== null && (
        <Tooltip x={x(points[hover].predicted) + m.left} y={y(points[hover].observed) + m.top - 10} width={size}>
          <div className="tt-x">
            {labels.x}: {pct(points[hover].predicted)}
          </div>
          <div className="tt-row">
            <span className="tt-key" style={{ background: 'var(--series-1)' }} />
            <strong>{pct(points[hover].observed)}</strong>
            <span>{labels.y}</span>
          </div>
          <div className="tt-note">
            95%: {pct(points[hover].lo)} – {pct(points[hover].hi)} · {labels.n}: {int(points[hover].n)}
          </div>
        </Tooltip>
      )}
    </div>
  );
}
