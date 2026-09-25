import { useId, useMemo, useState } from 'react';
import { scaleLinear } from 'd3-scale';
import { area, line, curveLinear, curveStepAfter, curveMonotoneX } from 'd3-shape';
import { useWidth, YAxis, XAxis, Tooltip, Legend, niceTicks, type Tick } from './core';

export interface Pt {
  x: number;
  y: number;
}
export interface Series {
  key: string;
  label: string;
  color: string;
  points: Pt[];
  dash?: boolean;
  width?: number;
  opacity?: number;
  curve?: 'linear' | 'step' | 'smooth';
  /** thin, unlabeled texture lines (no legend, no tooltip) */
  texture?: boolean;
  endLabel?: string;
  hideDot?: boolean;
}
export interface Band {
  key: string;
  label: string;
  color: string;
  points: { x: number; lo: number; hi: number }[];
}

interface Props {
  series: Series[];
  bands?: Band[];
  height?: number;
  xDomain?: [number, number];
  yDomain?: [number, number];
  xTicks?: Tick[];
  yTickCount?: number;
  xFormat: (x: number) => string;
  yFormat: (y: number) => string;
  tooltipX?: (x: number) => string;
  tooltipY?: (y: number) => string;
  zero?: number;
  annotations?: { x: number; label: string }[];
  hLines?: { y: number; label: string }[];
  legend?: boolean;
  ariaLabel: string;
  rightPad?: number;
}

const curves = { linear: curveLinear, step: curveStepAfter, smooth: curveMonotoneX };

export default function LineChart(props: Props) {
  const {
    series,
    bands = [],
    height = 340,
    xFormat,
    yFormat,
    tooltipX = xFormat,
    tooltipY = yFormat,
    annotations = [],
    hLines = [],
    legend = true,
    ariaLabel,
  } = props;
  const [ref, width] = useWidth<HTMLDivElement>();
  const [hover, setHover] = useState<number | null>(null);
  const clipId = 'clip' + useId().replace(/:/g, '');

  const labelled = series.filter((s) => !s.texture);
  const endLabels = labelled.some((s) => s.endLabel);
  const m = { top: 16, right: props.rightPad ?? (endLabels ? 96 : 16), bottom: 30, left: 44 };
  const iw = Math.max(10, width - m.left - m.right);
  const ih = height - m.top - m.bottom;

  const { x, y, yTicks, xTicks, xs } = useMemo(() => {
    const allX: number[] = [];
    const allY: number[] = [];
    for (const s of series) for (const p of s.points) (allX.push(p.x), allY.push(p.y));
    for (const b of bands) for (const p of b.points) (allX.push(p.x), allY.push(p.lo, p.hi));
    for (const h of hLines) allY.push(h.y);
    const xd = props.xDomain ?? [Math.min(...allX), Math.max(...allX)];
    let yd = props.yDomain ?? [Math.min(...allY), Math.max(...allY)];
    if (!props.yDomain) {
      const pad = (yd[1] - yd[0]) * 0.06 || 1;
      yd = [yd[0] - pad, yd[1] + pad];
      if (props.zero !== undefined) yd = [Math.min(yd[0], props.zero), Math.max(yd[1], props.zero)];
    }
    const yt = niceTicks(yd[0], yd[1], props.yTickCount ?? 5);
    const ydNice: [number, number] = props.yDomain ?? [Math.min(yd[0], yt[0]), Math.max(yd[1], yt[yt.length - 1])];
    const xs = scaleLinear().domain(xd).range([0, iw]);
    const ys = scaleLinear().domain(ydNice).range([ih, 0]);
    const xt = props.xTicks ?? niceTicks(xd[0], xd[1], Math.max(2, Math.floor(iw / 90))).map((v) => ({ value: v, label: xFormat(v) }));
    const lead = labelled[0] ?? series[0];
    const xsUnion = lead ? lead.points.map((p) => p.x) : [];
    return { x: xs, y: ys, yTicks: yt.map((v) => ({ value: v, label: yFormat(v) })), xTicks: xt, xs: xsUnion };
  }, [series, bands, iw, ih, props.xDomain, props.yDomain, props.xTicks]);

  const nearest = (px: number) => {
    const xv = x.invert(px);
    let best = 0;
    for (let i = 1; i < xs.length; i++) if (Math.abs(xs[i] - xv) < Math.abs(xs[best] - xv)) best = i;
    return xs[best];
  };

  const valueAt = (s: Series, xv: number) => {
    const pts = s.points;
    if (s.curve === 'step') {
      let v = pts[0]?.y;
      for (const p of pts) {
        if (p.x > xv) break;
        v = p.y;
      }
      return v;
    }
    let best = pts[0];
    for (const p of pts) if (Math.abs(p.x - xv) < Math.abs(best.x - xv)) best = p;
    return best?.y;
  };

  // de-collide end labels
  const ends = labelled
    .filter((s) => s.endLabel && s.points.length)
    .map((s) => ({ s, y: y(s.points[s.points.length - 1].y) }))
    .sort((a, b) => a.y - b.y);
  for (let i = 1; i < ends.length; i++) if (ends[i].y - ends[i - 1].y < 15) ends[i].y = ends[i - 1].y + 15;

  const hx = hover !== null ? x(hover) : null;

  return (
    <div className="ug-chart" ref={ref} style={{ position: 'relative' }}>
      {legend && labelled.length + bands.length >= 2 && (
        <Legend
          items={[
            ...labelled.map((s) => ({ label: s.label, color: s.color, kind: s.dash ? ('dash' as const) : ('line' as const) })),
            ...bands.map((b) => ({ label: b.label, color: b.color, kind: 'band' as const })),
          ]}
        />
      )}
      <svg
        width={width}
        height={height}
        role="img"
        aria-label={ariaLabel}
        onPointerMove={(e) => {
          const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const px = e.clientX - r.left - m.left;
          if (px < 0 || px > iw) return setHover(null);
          setHover(nearest(px));
        }}
        onPointerLeave={() => setHover(null)}
        style={{ touchAction: 'pan-y', overflow: 'visible' }}
      >
        <defs>
          <clipPath id={clipId}>
            <rect x={-2} y={-2} width={iw + 4} height={ih + 4} />
          </clipPath>
        </defs>
        <g transform={`translate(${m.left},${m.top})`}>
          <YAxis ticks={yTicks} scale={y} width={iw} zero={props.zero} x={-m.left} />
          <XAxis ticks={xTicks} scale={x} y={ih} />
          {annotations.map((a) => (
            <g key={a.label} transform={`translate(${x(a.x)},0)`}>
              <line y1={0} y2={ih} stroke="var(--ink-3)" strokeWidth={1} strokeDasharray="2 3" />
              <text x={x(a.x) > iw * 0.75 ? -5 : 5} y={10} textAnchor={x(a.x) > iw * 0.75 ? 'end' : 'start'} fontSize={11.5} fill="var(--ink-2)">
                {a.label}
              </text>
            </g>
          ))}
          {bands.map((b) => (
            <path
              key={b.key}
              d={
                area<{ x: number; lo: number; hi: number }>()
                  .x((d) => x(d.x))
                  .y0((d) => y(d.lo))
                  .y1((d) => y(d.hi))
                  .curve(curveMonotoneX)(b.points) ?? ''
              }
              fill={b.color}
            />
          ))}
          {hLines.map((h) => (
            <g key={h.label}>
              <line x1={0} x2={iw} y1={y(h.y)} y2={y(h.y)} stroke="var(--ink-2)" strokeWidth={1} strokeDasharray="4 3" />
              <text x={iw} y={y(h.y) - 6} textAnchor="end" fontSize={11.5} fill="var(--ink-2)">
                {h.label}
              </text>
            </g>
          ))}
          <g clipPath={`url(#${clipId})`}>
          {series.map((s) => (
            <path
              key={s.key}
              d={
                line<Pt>()
                  .x((d) => x(d.x))
                  .y((d) => y(d.y))
                  .curve(curves[s.curve ?? 'linear'])(s.points) ?? ''
              }
              fill="none"
              stroke={s.color}
              strokeWidth={s.width ?? (s.texture ? 1 : 2)}
              strokeOpacity={s.opacity ?? 1}
              strokeDasharray={s.dash ? '5 4' : undefined}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
          ))}
          </g>
          {labelled
            .filter((s) => !s.hideDot && s.points.length)
            .map((s) => {
              const p = s.points[s.points.length - 1];
              return <circle key={s.key} cx={x(p.x)} cy={y(p.y)} r={4} fill={s.color} stroke="var(--paper)" strokeWidth={2} />;
            })}
          {ends.map(({ s, y: ly }) => (
            <text key={s.key} x={iw + 10} y={ly} dy="0.32em" fontSize={12} fill="var(--ink-2)" fontWeight={500}>
              {s.endLabel}
            </text>
          ))}
          {hx !== null && hover !== null && (
            <g>
              <line x1={hx} x2={hx} y1={0} y2={ih} stroke="var(--ink-3)" strokeWidth={1} />
              {labelled.map((s) => {
                const v = valueAt(s, hover);
                return v === undefined ? null : <circle key={s.key} cx={hx} cy={y(v)} r={4} fill={s.color} stroke="var(--paper)" strokeWidth={2} />;
              })}
            </g>
          )}
        </g>
      </svg>
      {hx !== null && hover !== null && (
        <Tooltip x={hx + m.left} y={m.top + 24} width={width}>
          <div className="tt-x">{tooltipX(hover)}</div>
          {labelled.map((s) => {
            const v = valueAt(s, hover);
            return v === undefined ? null : (
              <div className="tt-row" key={s.key}>
                <span className="tt-key" style={{ background: s.color }} />
                <strong>{tooltipY(v)}</strong>
                <span>{s.label}</span>
              </div>
            );
          })}
          {bands.map((b) => {
            const p = b.points.reduce((a, c) => (Math.abs(c.x - hover) < Math.abs(a.x - hover) ? c : a), b.points[0]);
            return (
              <div className="tt-row" key={b.key}>
                <span className="tt-key band" style={{ background: b.color }} />
                <strong>
                  {tooltipY(p.lo)} – {tooltipY(p.hi)}
                </strong>
                <span>{b.label}</span>
              </div>
            );
          })}
        </Tooltip>
      )}
    </div>
  );
}
