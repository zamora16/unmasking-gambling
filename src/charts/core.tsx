import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from 'react';

const useIso = typeof window === 'undefined' ? useEffect : useLayoutEffect;

/** Width of a container, tracked with ResizeObserver. */
export function useWidth<T extends HTMLElement>(fallback = 720) {
  const ref = useRef<T>(null);
  const [w, setW] = useState(fallback);
  useIso(() => {
    const el = ref.current;
    if (!el) return;
    setW(el.clientWidth || fallback);
    const ro = new ResizeObserver((entries) => {
      for (const e of entries) setW(Math.max(260, Math.round(e.contentRect.width)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, w] as const;
}

export interface Margin {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export interface Tick {
  value: number;
  label: string;
}

export function YAxis({ ticks, scale, width, x = 0, zero }: { ticks: Tick[]; scale: (v: number) => number; width: number; x?: number; zero?: number }) {
  return (
    <g className="axis y" aria-hidden="true">
      {ticks.map((t) => (
        <g key={t.value} transform={`translate(0,${scale(t.value)})`}>
          <line x1={x < 0 ? 0 : x} x2={width} stroke={t.value === zero ? 'var(--rule-strong)' : 'var(--grid)'} strokeWidth={1} shapeRendering="crispEdges" />
          <text x={x} dy={x < 0 ? '0.32em' : '-0.4em'} fill="var(--ink-3)" fontSize={11.5}>
            {t.label}
          </text>
        </g>
      ))}
    </g>
  );
}

export function XAxis({ ticks, scale, y, anchor = 'middle' }: { ticks: Tick[]; scale: (v: number) => number; y: number; anchor?: 'middle' | 'start' | 'end' }) {
  return (
    <g className="axis x" aria-hidden="true" transform={`translate(0,${y})`}>
      <line x1={scale(ticks[0]?.value ?? 0)} x2={scale(ticks[ticks.length - 1]?.value ?? 0)} stroke="var(--rule-strong)" shapeRendering="crispEdges" />
      {ticks.map((t) => (
        <text key={t.value} x={scale(t.value)} y={18} textAnchor={anchor} fill="var(--ink-3)" fontSize={11.5}>
          {t.label}
        </text>
      ))}
    </g>
  );
}

export function Tooltip({ x, y, width, children }: { x: number; y: number; width: number; children: ReactNode }) {
  const left = x > width * 0.6;
  return (
    <div
      className="ug-tooltip"
      role="presentation"
      style={{
        position: 'absolute',
        top: y,
        left: left ? undefined : x + 14,
        right: left ? width - x + 14 : undefined,
        pointerEvents: 'none',
      }}
    >
      {children}
    </div>
  );
}

export function Legend({ items }: { items: { label: string; color: string; kind?: 'line' | 'rect' | 'band' | 'dash' }[] }) {
  return (
    <ul className="ug-legend">
      {items.map((it) => (
        <li key={it.label}>
          <svg width="18" height="10" aria-hidden="true">
            {it.kind === 'rect' || it.kind === 'band' ? (
              <rect x="1" y="1" width="16" height="8" rx="2" fill={it.color} opacity={it.kind === 'band' ? 1 : 1} />
            ) : (
              <line x1="1" x2="17" y1="5" y2="5" stroke={it.color} strokeWidth="2.5" strokeLinecap="round" strokeDasharray={it.kind === 'dash' ? '3 3' : undefined} />
            )}
          </svg>
          {it.label}
        </li>
      ))}
    </ul>
  );
}

export function DataTable({ caption, columns, rows, showLabel, hideLabel }: { caption: string; columns: string[]; rows: (string | number)[][]; showLabel: string; hideLabel: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="ug-table-wrap">
      <button type="button" className="ug-table-toggle" aria-expanded={open} onClick={() => setOpen(!open)}>
        {open ? hideLabel : showLabel}
      </button>
      {open && (
        <div className="ug-table-scroll">
          <table className="ug-table">
            <caption className="visually-hidden">{caption}</caption>
            <thead>
              <tr>
                {columns.map((c) => (
                  <th key={c} scope="col">
                    {c}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (j === 0 ? <th key={j} scope="row">{c}</th> : <td key={j}>{c}</td>))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/** "Nice" ticks for a linear domain. */
export function niceTicks(lo: number, hi: number, count = 5): number[] {
  const span = hi - lo || 1;
  const step0 = span / count;
  const mag = 10 ** Math.floor(Math.log10(step0));
  const err = step0 / mag;
  const step = (err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1) * mag;
  const start = Math.ceil(lo / step) * step;
  const out: number[] = [];
  for (let v = start; v <= hi + step * 1e-9; v += step) out.push(Math.round(v / step) * step);
  return out;
}

/** Two versions of a text: plain (default) and technical (shown in technical mode). */
export function Dual({ simple, tech }: { simple: ReactNode; tech: ReactNode }) {
  return (
    <>
      <span className="only-simple">{simple}</span>
      <span className="only-tech">{tech}</span>
    </>
  );
}
