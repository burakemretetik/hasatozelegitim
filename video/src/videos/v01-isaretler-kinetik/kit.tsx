import React from 'react';
import {AbsoluteFill, Easing} from 'remotion';
import {C, FONT} from '../../shared/brand';
import {FONT_METRICS, METRICS, STYLE, StyleId} from './metrics';
import {EASE, T, ramp} from './timing';

/* ------------------------------------------------------------------ grid */
export const X0 = 96; // left text edge (safe zone starts at 80)
export const X1 = 924; // right text edge (safe zone ends at 940)
export const W = X1 - X0;

export type Pal = {bg: string; main: string; soft: string; acc: string; swap: string; off: string};
export const PAL: Record<'cream' | 'green' | 'orange', Pal> = {
  cream: {bg: C.cream, main: C.green, soft: C.text2, acc: C.orange, swap: C.green, off: 'rgba(18,49,43,0.14)'},
  green: {bg: C.green, main: C.cream, soft: C.sage, acc: C.orange, swap: C.green, off: 'rgba(244,246,243,0.18)'},
  orange: {bg: C.orange, main: C.green, soft: C.green, acc: C.green, swap: C.orange, off: 'rgba(18,49,43,0.2)'},
};

/* ------------------------------------------------------------- metrics */
export const met = (s: StyleId, t: string) => {
  const m = METRICS[`${s}|${t}`];
  if (!m) throw new Error(`v01: missing metric ${s}|${t}`);
  return m;
};
export const css = (s: StyleId): React.CSSProperties => ({
  fontFamily: STYLE[s].f === 'i' ? FONT.body : FONT.heading,
  fontWeight: STYLE[s].w,
  letterSpacing: `${STYLE[s].ls}em`,
});
/** baseline position inside a line-height:1 box, in em */
const bOff = (s: StyleId) => {
  const fm = FONT_METRICS[s];
  return (1 - (fm.fa + fm.fd) / 100) / 2 + fm.fa / 100;
};

/* --------------------------------------------------------------- lines */
export type Line = {
  text: string;
  style: StyleId;
  size: number;
  x: number; // ink left
  baseline: number;
  color: string;
  swap?: string; // text colour where the marker passes
  marker?: boolean;
  underline?: boolean;
  starts: number[]; // word start frames (local)
  exit: number; // exit start frame (local)
  top: number; // ink top
  bottom: number; // ink bottom
  inkW: number;
};
export type LineIn = {
  text: string;
  style: StyleId;
  color: string;
  size?: number;
  swap?: string;
  marker?: boolean;
  underline?: boolean;
  gap?: number;
};

/**
 * Ink-accurate vertical stack. Without `size` a line is fitted (justified) to `width`.
 * `step` = fixed baseline-to-baseline distance (uniform leading); otherwise ink-box gaps.
 */
export const stack = (
  ins: LineIn[],
  o: {x?: number; width?: number; top?: number; center?: number; gap?: number; step?: number},
): Line[] => {
  const x = o.x ?? X0;
  const width = o.width ?? W;
  const out: Line[] = [];
  ins.forEach((l, i) => {
    const m = met(l.style, l.text);
    const size = l.size ?? (width / (m.l + m.r)) * 100;
    const a = (m.a * size) / 100;
    const d = (Math.max(m.d, 6) * size) / 100;
    const baseline =
      i === 0 ? a : o.step !== undefined ? out[0].baseline + i * o.step : out[i - 1].bottom + (l.gap ?? o.gap ?? 20) + a;
    out.push({...l, size, x, baseline, top: baseline - a, bottom: baseline + d, inkW: ((m.l + m.r) * size) / 100, starts: [], exit: 9999});
  });
  const h = out[out.length - 1].bottom - out[0].top;
  const top0 = o.top ?? (o.center ?? 870) - h / 2;
  const dy = top0 - out[0].top;
  out.forEach((l) => {
    l.baseline += dy;
    l.top += dy;
    l.bottom += dy;
  });
  return out;
};

/** assign word start frames; returns the start of the last word */
export const schedule = (lines: Line[], start: number, word: number = T.WORD, line: number = T.LINE) => {
  let t = start;
  lines.forEach((l, i) => {
    if (i > 0) t += line;
    l.starts = l.text.split(' ').map(() => {
      const s = t;
      t += word;
      return s;
    });
  });
  return t - word;
};
export const setExit = (lines: Line[], exit: number) =>
  lines.forEach((l, i) => {
    l.exit = exit + i * T.EXIT_LINE;
  });

const PT = 0.24;
const PB = 0.22;
const PX = 0.14;

/** One masked line; each word rises out of the mask and leaves upwards through it. */
export const KLine: React.FC<{l: Line; f: number; color?: string; clip?: (divLeft: number, divTop: number) => string}> = ({l, f, color, clip}) => {
  const m = met(l.style, l.text);
  const s = l.size;
  const originX = l.x + (m.l * s) / 100;
  const left = originX - PX * s;
  const top = l.baseline - bOff(l.style) * s - PT * s;
  const maskH = (1 + PT + PB) * s;
  const ex = ramp(f, l.exit, T.EXIT, EASE.in);
  const words = l.text.split(' ');
  return (
    <div
      style={{
        position: 'absolute',
        left,
        top,
        height: maskH,
        padding: `${PT * s}px ${PX * s}px 0 ${PX * s}px`,
        overflow: 'hidden',
        whiteSpace: 'pre',
        fontSize: s,
        lineHeight: 1,
        color: color ?? l.color,
        clipPath: clip ? clip(left, top) : undefined,
        fontKerning: 'normal',
        ...css(l.style),
      }}
    >
      {words.map((w, i) => {
        const p = ramp(f, l.starts[i] ?? 0, T.RISE);
        const y = (1 - p) * maskH - ex * maskH;
        return (
          <React.Fragment key={i}>
            {i > 0 ? ' ' : ''}
            <span style={{display: 'inline-block', transform: `translateY(${y.toFixed(2)}px)`}}>{w}</span>
          </React.Fragment>
        );
      })}
    </div>
  );
};

export type MarkerSpec = {lines: number[]; start: number; exit: number; color: string; padX?: number; padY?: number};

/** Lines + orange marker blocks (behind) + colour-swapped text copies (above the marker). */
export const Lines: React.FC<{lines: Line[]; f: number; markers?: MarkerSpec[]; underline?: {color: string; delay: number}}> = ({
  lines,
  f,
  markers = [],
  underline,
}) => {
  const boxes = markers.map((mk) => {
    const ls = mk.lines.map((i) => lines[i]);
    const padY = mk.padY ?? 0.09;
    const padX = mk.padX ?? 22;
    const top = Math.min(...ls.map((l) => l.top - padY * l.size));
    const bottom = Math.max(...ls.map((l) => l.bottom + padY * l.size));
    const left = Math.min(...ls.map((l) => l.x)) - padX;
    const right = Math.max(...ls.map((l) => l.x + l.inkW)) + padX;
    const a = ramp(f, mk.start, T.MARKER, EASE.out);
    const e = ramp(f, mk.exit, T.EXIT - 2, EASE.in);
    // grows left→right; on exit it folds upwards together with the words
    const L = left;
    const R = left + a * (right - left);
    const B = bottom - e * (bottom - top);
    return {mk, top, bottom: B, L, R, visible: R - L > 0.5 && B - top > 0.5};
  });
  return (
    <>
      {boxes.map((b, i) =>
        b.visible ? (
          <div key={'m' + i} style={{position: 'absolute', left: b.L, width: b.R - b.L, top: b.top, height: b.bottom - b.top, background: b.mk.color}} />
        ) : null,
      )}
      {lines.map((l, i) => (
        <KLine key={i} l={l} f={f} />
      ))}
      {boxes.map((b, i) =>
        b.visible
          ? b.mk.lines
              .filter((li) => lines[li].swap && lines[li].swap !== lines[li].color)
              .map((li) => (
                <KLine
                  key={`s${i}-${li}`}
                  l={lines[li]}
                  f={f}
                  color={lines[li].swap}
                  clip={(dl, dt) => `polygon(${b.L - dl}px ${b.top - dt}px, ${b.R - dl}px ${b.top - dt}px, ${b.R - dl}px ${b.bottom - dt}px, ${b.L - dl}px ${b.bottom - dt}px)`}
                />
              ))
          : null,
      )}
      {underline
        ? lines
            .filter((l) => l.underline)
            .map((l, i) => {
              const s0 = l.starts[l.starts.length - 1] + underline.delay;
              const a = ramp(f, s0, 16, EASE.out);
              const e = ramp(f, l.exit, T.EXIT - 2, EASE.in);
              const h = Math.max(12, l.size * 0.07);
              const y = l.bottom + h * 0.9;
              return (
                <div
                  key={'u' + i}
                  style={{
                    position: 'absolute',
                    left: l.x + e * l.inkW,
                    width: Math.max(0, (a - e) * l.inkW),
                    top: y,
                    height: h,
                    background: underline.color,
                  }}
                />
              );
            })
        : null}
    </>
  );
};

/* ----------------------------------------------------------- numerals */
const BACK = Easing.bezier(0.34, 1.32, 0.64, 1);

/** Giant outline numeral (outline in `stroke`, inside = `bg`) that fills with orange from the bottom up. */
export const Numeral: React.FC<{
  n: string;
  x: number;
  baseline: number;
  size: number;
  f: number;
  start: number;
  fillStart: number;
  exit: number;
  stroke: string;
  bg: string;
  fill: string;
  outline?: boolean;
}> = ({n, x, baseline, size, f, start, fillStart, exit, stroke, bg, fill, outline = true}) => {
  const m = met('N', n);
  const originX = x + (m.l * size) / 100;
  const inkTop = baseline - (m.a * size) / 100;
  const inkBottom = baseline + (Math.max(m.d, 1) * size) / 100;
  const inkH = inkBottom - inkTop;
  const maskTop = inkTop - 0.12 * size;
  const maskH = inkH + 0.24 * size;
  const p = ramp(f, start, 24, BACK);
  const ex = ramp(f, exit, T.EXIT + 2, EASE.in);
  const y = (1 - p) * maskH - ex * maskH;
  const q = outline ? ramp(f, fillStart, 30, EASE.inOut) : 1;
  const sw = size * 0.012;
  const id = `v01n${n}${Math.round(x)}`;
  const textProps = {x: originX, y: baseline, fontSize: size, fontFamily: FONT.heading, fontWeight: 800, letterSpacing: '-0.01em'};
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0, overflow: 'visible'}}>
      <defs>
        <clipPath id={id + 'm'}>
          <rect x={0} y={maskTop} width={1080} height={maskH} />
        </clipPath>
        <clipPath id={id + 'f'}>
          <rect x={0} y={inkBottom + 4 - q * (inkH + 8)} width={1080} height={inkH + 16} />
        </clipPath>
      </defs>
      <g clipPath={`url(#${id}m)`}>
        <g transform={`translate(0 ${y.toFixed(2)})`}>
          {outline ? (
            <text {...textProps} fill={bg} stroke={stroke} strokeWidth={sw * 2} strokeLinejoin="round" paintOrder="stroke fill">
              {n}
            </text>
          ) : null}
          <g clipPath={`url(#${id}f)`}>
            <text {...textProps} fill={fill}>
              {n}
            </text>
          </g>
        </g>
      </g>
    </svg>
  );
};

/* -------------------------------------------------------------- accents */
/** Five-segment progress meter (geometric accent). */
export const Progress: React.FC<{
  x: number; // left edge (or right edge if `alignRight`)
  y: number; // bottom
  current: number; // 1..5, 0 = all accent
  f: number;
  start: number;
  exit: number;
  pal: Pal;
  alignRight?: boolean;
  w?: number;
}> = ({x, y, current, f, start, exit, pal, alignRight, w = 58}) => {
  const h = 14;
  const gap = 12;
  const total = 5 * w + 4 * gap;
  const left = alignRight ? x - total : x;
  const e = ramp(f, exit, T.EXIT - 2, EASE.in);
  return (
    <>
      {[0, 1, 2, 3, 4].map((i) => {
        const a = ramp(f, start + i * 2, 12, EASE.out);
        const isCur = current === 0 || i === current - 1;
        const done = current !== 0 && i < current - 1;
        const fillP = current === 0 ? a : ramp(f, start + 12, 18, EASE.out);
        const bx = left + i * (w + gap);
        return (
          <div key={i} style={{position: 'absolute', left: bx, top: y - h, width: w, height: h, transform: `scaleY(${(1 - e).toFixed(3)})`, transformOrigin: '50% 100%'}}>
            <div style={{position: 'absolute', inset: 0, background: done ? pal.main : pal.off, transform: `scaleX(${a.toFixed(3)})`, transformOrigin: '0 50%'}} />
            {isCur ? <div style={{position: 'absolute', inset: 0, background: pal.acc === C.green ? C.green : C.orange, transform: `scaleX(${fillP.toFixed(3)})`, transformOrigin: '0 50%'}} /> : null}
          </div>
        );
      })}
    </>
  );
};

/* ---------------------------------------------------------------- wipe */
/** Two-layer colour-block wipe: an accent panel leads, the scene's background panel follows; content is clipped to it. */
export const Wipe: React.FC<{f: number; dir: 'up' | 'left'; accent: string; bg: string; children: React.ReactNode; none?: boolean}> = ({
  f,
  dir,
  accent,
  bg,
  children,
  none,
}) => {
  if (none) return <AbsoluteFill style={{background: bg}}>{children}</AbsoluteFill>;
  const a = ramp(f, 0, T.WIPE, EASE.wipe);
  const b = ramp(f, T.WIPE_LAG, T.WIPE, EASE.wipe);
  const clip = (p: number) => (dir === 'up' ? `inset(${((1 - p) * 100).toFixed(3)}% 0 0 0)` : `inset(0 0 0 ${((1 - p) * 100).toFixed(3)}%)`);
  return (
    <AbsoluteFill>
      {b < 1 ? <AbsoluteFill style={{background: accent, clipPath: clip(a)}} /> : null}
      <AbsoluteFill style={{background: bg, clipPath: b < 1 ? clip(b) : undefined}}>{children}</AbsoluteFill>
    </AbsoluteFill>
  );
};
