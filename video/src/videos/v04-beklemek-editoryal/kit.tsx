import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {evolvePath} from '@remotion/paths';
import {C, FONT} from '../../shared/brand';
import {EXIT, RISE} from './timing';

// ── Palette for this style: brand green ink + orange accent on warm paper.
export const PAPER = '#F5F0E5'; // warm off-white stock (supporting colour)
export const PAPER_DEEP = '#E7DFCF'; // shadowed paper / page edge
export const INK = C.green;
export const INK2 = C.text2;
export const ACCENT = C.orange;
export const ACCENT_INK = C.orangeDeep; // orange that is legible as text
export const HAIR = 'rgba(18,49,43,0.38)';

// ── Layout: text column (inside the social safe zone, generous margins)
export const COL = {left: 122, right: 930} as const;
export const COL_W = COL.right - COL.left;

// ── Easing
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
export const EASE_INOUT = Easing.bezier(0.65, 0, 0.35, 1);
export const EASE_IN = Easing.bezier(0.55, 0, 0.75, 0.25);
export const EASE_DRAW = Easing.bezier(0.45, 0.05, 0.25, 1);

/** Clamped 0..1 progress between two frames with easing. */
export const tween = (f: number, a: number, b: number, ease: (t: number) => number = EASE_OUT) =>
  interpolate(f, [a, b], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing: ease});

/** Fraunces with optical size / softness axes. */
export const serif = (opsz: number, soft = 0, wonk = 0): React.CSSProperties => ({
  fontFamily: FONT.serif,
  fontVariationSettings: `'opsz' ${opsz}, 'SOFT' ${soft}, 'WONK' ${wonk}`,
  fontFeatureSettings: "'kern' 1, 'liga' 1",
});

/**
 * A single typeset line that rises out of its own mask (and, optionally, leaves upward
 * through it again). The mask clips only top/bottom so italics and hanging punctuation
 * can overhang horizontally.
 */
export const Rise: React.FC<{
  at: number;
  out?: number;
  lh: number; // line box height in px
  padTop?: number;
  padBottom?: number;
  dur?: number;
  outDur?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({at, out, lh, padTop = 26, padBottom = 26, dur = RISE, outDur = EXIT, style, children}) => {
  const f = useCurrentFrame();
  const pin = tween(f, at, at + dur, EASE_OUT);
  const pout = out === undefined ? 0 : tween(f, out, out + outDur, EASE_IN);
  const y = (1 - pin) * (lh + padTop + 6) - pout * (lh + padBottom + 6);
  const opacity = interpolate(pin, [0, 0.45], [0, 1], {extrapolateRight: 'clamp'}) * (1 - 0.6 * pout);
  if (pin <= 0 || pout >= 1) {
    return <div style={{height: lh, ...style}} />;
  }
  return (
    <div
      style={{
        height: lh,
        clipPath: `inset(${-padTop}px -400px ${-padBottom}px -400px)`,
        ...style,
      }}
    >
      <div style={{transform: `translateY(${y.toFixed(2)}px)`, opacity, whiteSpace: 'nowrap', lineHeight: `${lh}px`}}>
        {children}
      </div>
    </div>
  );
};

/** A hairline / rule that draws itself from the left. */
export const Rule: React.FC<{
  at: number;
  out?: number;
  width: number;
  thick?: number;
  color?: string;
  dur?: number;
  style?: React.CSSProperties;
}> = ({at, out, width, thick = 2, color = HAIR, dur = 30, style}) => {
  const f = useCurrentFrame();
  const p = tween(f, at, at + dur, EASE_INOUT);
  const po = out === undefined ? 0 : tween(f, out, out + 22, EASE_INOUT);
  return (
    <div
      style={{
        width,
        height: thick,
        background: color,
        transformOrigin: po > 0 ? 'right center' : 'left center',
        transform: `scaleX(${po > 0 ? 1 - po : p})`,
        ...style,
      }}
    />
  );
};

/** Paper stock: warm base, fibre mottling, fine grain, soft vignette (static, deterministic). */
export const Paper: React.FC<{seed?: number; base?: string; dark?: boolean}> = ({seed = 3, base = PAPER, dark = false}) => {
  const id = `v04paper${seed}${dark ? 'd' : ''}`;
  return (
    <AbsoluteFill style={{background: base}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs>
          <filter id={`${id}m`} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.006 0.011" numOctaves={4} seed={seed + 11} />
            <feColorMatrix
              type="matrix"
              values={
                dark
                  ? '0 0 0 0 0.02  0 0 0 0 0.08  0 0 0 0 0.07  0 0 0 1.6 -0.62'
                  : '0 0 0 0 0.55  0 0 0 0 0.46  0 0 0 0 0.30  0 0 0 1.6 -0.62'
              }
            />
          </filter>
          <radialGradient id={`${id}v`} cx="50%" cy="46%" r="78%">
            <stop offset="55%" stopColor={dark ? '#000' : '#7a6440'} stopOpacity={0} />
            <stop offset="100%" stopColor={dark ? '#000' : '#7a6440'} stopOpacity={dark ? 0.32 : 0.13} />
          </radialGradient>
        </defs>
        <rect width="100%" height="100%" filter={`url(#${id}m)`} opacity={dark ? 0.35 : 0.14} />
        <rect width="100%" height="100%" fill={`url(#${id}v)`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Fine paper grain laid over everything on a page (so ink sits *in* the paper). */
export const Grain: React.FC<{seed?: number; dark?: boolean; opacity?: number}> = ({seed = 3, dark = false, opacity}) => {
  const id = `v04grain${seed}${dark ? 'd' : ''}`;
  return (
    <AbsoluteFill style={{pointerEvents: 'none'}}>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        <defs>
          <filter id={id} x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} stitchTiles="stitch" />
            <feColorMatrix
              type="matrix"
              values={
                dark
                  ? '0 0 0 0 0.85  0 0 0 0 0.9  0 0 0 0 0.86  0 0 0 2.2 -1.05'
                  : '0 0 0 0 0.30  0 0 0 0 0.24  0 0 0 0 0.14  0 0 0 2.2 -1.0'
              }
            />
          </filter>
        </defs>
        <rect width="100%" height="100%" filter={`url(#${id})`} opacity={opacity ?? (dark ? 0.22 : 0.42)} />
      </svg>
    </AbsoluteFill>
  );
};

/** Draws an SVG path progressively (pen stroke). */
export const DrawPath: React.FC<{
  d: string;
  p: number;
  stroke?: string;
  width?: number;
  opacity?: number;
  fill?: string;
}> = ({d, p, stroke = INK, width = 3, opacity = 1, fill = 'none'}) => {
  if (p <= 0) return null;
  const ev = evolvePath(Math.min(1, p), d);
  return (
    <path
      d={d}
      fill={fill}
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeDasharray={ev.strokeDasharray}
      strokeDashoffset={ev.strokeDashoffset}
      opacity={opacity}
    />
  );
};

/** Hand-drawn orange marker underline that sits under its parent span. */
export const HandUnderline: React.FC<{at: number; out?: number}> = ({at, out}) => {
  const f = useCurrentFrame();
  const p1 = tween(f, at, at + 20, EASE_DRAW);
  const p2 = tween(f, at + 14, at + 32, EASE_DRAW);
  const fade = out === undefined ? 1 : 1 - tween(f, out, out + 14, EASE_INOUT);
  return (
    <svg
      viewBox="0 0 600 60"
      preserveAspectRatio="none"
      style={{position: 'absolute', left: '-3%', width: '106%', bottom: -34, height: 46, overflow: 'visible', opacity: fade}}
    >
      <DrawPath d="M 6 22 C 120 12, 250 8, 380 13 S 548 22, 594 15" p={p1} stroke={ACCENT} width={9} />
      <DrawPath d="M 60 44 C 200 35, 360 33, 560 38" p={p2} stroke={ACCENT} width={6} opacity={0.9} />
    </svg>
  );
};

/** Hand-drawn loose loop (circle) around its parent span. */
const loopPath = (() => {
  const pts: string[] = [];
  const n = 90;
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const a = -2.55 + t * Math.PI * 2 * 1.1;
    const rx = 290 + 10 * Math.sin(t * 7.0) + 12 * t;
    const ry = 98 + 6 * Math.cos(t * 5.0) - 10 * t;
    const x = 300 + rx * Math.cos(a) + 6 * t;
    const y = 110 + ry * Math.sin(a) - 4 * t * Math.cos(a);
    // slight tilt
    const tilt = -0.05;
    const xr = 300 + (x - 300) * Math.cos(tilt) - (y - 110) * Math.sin(tilt);
    const yr = 110 + (x - 300) * Math.sin(tilt) + (y - 110) * Math.cos(tilt);
    pts.push(`${i === 0 ? 'M' : 'L'} ${xr.toFixed(1)} ${yr.toFixed(1)}`);
  }
  return pts.join(' ');
})();

export const HandCircle: React.FC<{at: number; dur?: number}> = ({at, dur = 34}) => {
  const f = useCurrentFrame();
  const p = tween(f, at, at + dur, EASE_DRAW);
  return (
    <svg
      viewBox="0 0 600 220"
      preserveAspectRatio="none"
      style={{position: 'absolute', left: '-16%', width: '132%', top: '-14%', height: '128%', overflow: 'visible'}}
    >
      <DrawPath d={loopPath} p={p} stroke={ACCENT} width={7} />
    </svg>
  );
};
