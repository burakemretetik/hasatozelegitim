// Paper toolkit: torn/cut outlines, paper texture, stop-motion poses, shadows.
import React from 'react';
import {Easing, interpolate, random, spring} from 'remotion';
import {noise2D} from '@remotion/noise';
import {C} from '../../shared/brand';

export type Pt = [number, number];
export type Outline = {d: string; rim: string};
export type EdgeKind = 'torn' | 'cut';

// ---------------------------------------------------------------- palette
export const P = {
  cream: '#F6F1E4',
  paper: '#FBF8F0',
  moon: '#F3EBD5',
  kraft: '#C79F6B',
  kraftLight: '#DDC398',
  kraftDark: '#9A744A',
  green: C.green,
  greenMid: '#2E5B4C',
  greenSoft: '#5E8A74',
  sage: '#A9C2B5',
  sageLight: '#CADAD1',
  orange: C.orange,
  orangeLight: '#F2C46F',
  orangeDeep: C.orangeDeep,
  skyTop: '#B3CDC6',
  sky: '#C2D7D0',
  skyLow: '#D2E2DA',
  dusk: '#E6B68A',
  duskLow: '#EFCBA2',
  ink: C.green,
};

const hexRgb = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const mix = (a: string, b: string, t: number) => {
  const A = hexRgb(a);
  const B = hexRgb(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
};
export const rimOf = (c: string) => mix(c, '#FFFCF4', 0.72);

// ---------------------------------------------------------------- outlines
const r1 = (n: number) => Math.round(n * 10) / 10;
const toD = (pts: Pt[]) => 'M' + pts.map((p) => `${r1(p[0])} ${r1(p[1])}`).join('L') + 'Z';
const area = (pts: Pt[]) => {
  let a = 0;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const q = pts[(i + 1) % pts.length];
    a += p[0] * q[1] - q[0] * p[1];
  }
  return a / 2;
};
/** clockwise on screen (y down) => positive area */
const cw = (pts: Pt[]) => (area(pts) < 0 ? [...pts].reverse() : pts);

const cache = new Map<string, Outline>();
export const memo = (key: string, fn: () => Outline): Outline => {
  let v = cache.get(key);
  if (!v) {
    v = fn();
    cache.set(key, v);
  }
  return v;
};

/** Polygon (clockwise corners) with per-edge kind. Torn edges get a white fibrous rim. */
export function outlinePoly(corners: Pt[], kinds: EdgeKind[], seed: string, amp = 1): Outline {
  const main: Pt[] = [];
  const rim: Pt[] = [];
  let s = 0;
  const n = corners.length;
  for (let e = 0; e < n; e++) {
    const a = corners[e];
    const b = corners[(e + 1) % n];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const nx = dy / len;
    const ny = -dx / len;
    const kind = kinds[e % kinds.length];
    if (kind === 'torn') {
      const count = Math.max(2, Math.round(len / 5));
      for (let i = 0; i < count; i++) {
        const t = i / count;
        const sl = s + t * len;
        const taper = Math.min(1, (t * len) / 16, ((1 - t) * len) / 16) * 0.75 + 0.25;
        const o =
          amp *
          taper *
          (2.6 * noise2D(seed, sl * 0.018, 0) + 1.1 * noise2D(seed, sl * 0.07, 3) + 1.0 * (random(`${seed}h${e}_${i}`) - 0.5));
        const r = o + amp * (1.3 + 2.0 * Math.abs(noise2D(seed + 'r', sl * 0.04, 1)) + 0.9 * random(`${seed}r${e}_${i}`));
        const px = a[0] + dx * t;
        const py = a[1] + dy * t;
        main.push([px + nx * o, py + ny * o]);
        rim.push([px + nx * r, py + ny * r]);
      }
    } else {
      const segs = Math.max(1, Math.round(len / 150));
      for (let i = 0; i < segs; i++) {
        const t = i / segs;
        let px = a[0] + dx * t;
        let py = a[1] + dy * t;
        let o = amp * 1.3 * (random(`${seed}c${e}_${i}`) - 0.5) * 2;
        if (i === 0) {
          o = 0;
          px += amp * 1.5 * (random(`${seed}kx${e}`) - 0.5) * 2;
          py += amp * 1.5 * (random(`${seed}ky${e}`) - 0.5) * 2;
        }
        main.push([px + nx * o, py + ny * o]);
        rim.push([px + nx * (o - 0.6), py + ny * (o - 0.6)]);
      }
    }
    s += len;
  }
  return {d: toD(main), rim: toD(rim)};
}

export const outlineRect = (w: number, h: number, seed: string, kinds: EdgeKind[] = ['cut', 'torn', 'cut', 'torn'], amp = 1) =>
  memo(`rect:${w}:${h}:${seed}:${kinds.join()}:${amp}`, () =>
    outlinePoly(
      [
        [0, 0],
        [w, 0],
        [w, h],
        [0, h],
      ],
      kinds,
      seed,
      amp,
    ),
  );

/** Dense closed loop -> irregular paper outline (periodic noise, no seam). */
export function outlineDense(baseIn: Pt[], seed: string, kind: EdgeKind = 'cut', amp = 1): Outline {
  const base = cw(baseIn);
  const n = base.length;
  let L = 0;
  const sArr: number[] = [];
  for (let i = 0; i < n; i++) {
    sArr.push(L);
    const a = base[i];
    const b = base[(i + 1) % n];
    L += Math.hypot(b[0] - a[0], b[1] - a[1]);
  }
  const main: Pt[] = [];
  const rim: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const prev = base[(i - 1 + n) % n];
    const next = base[(i + 1) % n];
    let tx = next[0] - prev[0];
    let ty = next[1] - prev[1];
    const tl = Math.hypot(tx, ty) || 1;
    tx /= tl;
    ty /= tl;
    const nx = ty;
    const ny = -tx;
    const ang = (sArr[i] / L) * Math.PI * 2;
    const per = (freq: number, off: number) => {
      const R = (L * freq) / (2 * Math.PI);
      return noise2D(seed + off, Math.cos(ang) * R, Math.sin(ang) * R);
    };
    let o: number;
    let r: number;
    if (kind === 'torn') {
      o = amp * (2.4 * per(0.018, 0) + 1.0 * per(0.07, 1) + 0.9 * (random(`${seed}t${i}`) - 0.5));
      r = o + amp * (1.3 + 1.9 * Math.abs(per(0.04, 2)) + 0.8 * random(`${seed}u${i}`));
    } else {
      o = amp * (1.1 * per(0.012, 0) + 0.35 * per(0.05, 1));
      r = o - 0.5;
    }
    main.push([base[i][0] + nx * o, base[i][1] + ny * o]);
    rim.push([base[i][0] + nx * r, base[i][1] + ny * r]);
  }
  return {d: toD(main), rim: toD(rim)};
}

// ---------------------------------------------------------------- base point generators
export const polyPts = (corners: Pt[], step = 5): Pt[] => {
  const out: Pt[] = [];
  for (let i = 0; i < corners.length; i++) {
    const a = corners[i];
    const b = corners[(i + 1) % corners.length];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]);
    const n = Math.max(1, Math.round(len / step));
    for (let k = 0; k < n; k++) out.push([a[0] + ((b[0] - a[0]) * k) / n, a[1] + ((b[1] - a[1]) * k) / n]);
  }
  return out;
};
export const arcPts = (cx: number, cy: number, rx: number, ry: number, a0: number, a1: number, n = 24): Pt[] =>
  Array.from({length: n + 1}, (_, i) => {
    const a = ((a0 + ((a1 - a0) * i) / n) * Math.PI) / 180;
    return [cx + rx * Math.cos(a), cy + ry * Math.sin(a)] as Pt;
  });
export const circlePts = (cx: number, cy: number, r: number, step = 5): Pt[] => {
  const n = Math.max(18, Math.round((2 * Math.PI * r) / step));
  return Array.from({length: n}, (_, i) => {
    const a = (i / n) * Math.PI * 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as Pt;
  });
};
export const roundRectPts = (x: number, y: number, w: number, h: number, r: number, step = 5): Pt[] =>
  polyPts(
    [
      ...arcPts(x + w - r, y + r, r, r, -90, 0, 6),
      ...arcPts(x + w - r, y + h - r, r, r, 0, 90, 6),
      ...arcPts(x + r, y + h - r, r, r, 90, 180, 6),
      ...arcPts(x + r, y + r, r, r, 180, 270, 6),
    ],
    step,
  );
export const starPts = (cx: number, cy: number, r: number, rot = -90): Pt[] =>
  polyPts(
    Array.from({length: 10}, (_, i) => {
      const a = ((rot + i * 36) * Math.PI) / 180;
      const rr = i % 2 === 0 ? r : r * 0.46;
      return [cx + rr * Math.cos(a), cy + rr * Math.sin(a)] as Pt;
    }),
    3,
  );
/** crescent opening to the right, then rotated */
export const crescentPts = (cx: number, cy: number, r: number, rotDeg: number): Pt[] => {
  const outer = arcPts(0, 0, r, r, 60, 300, 40);
  const ic = 0.22 * r;
  const ir = 0.9165 * r;
  const inner = arcPts(ic, 0, ir, ir, 288, 72, 36).slice(1, -1);
  const a = (rotDeg * Math.PI) / 180;
  return polyPts(
    [...outer, ...inner].map(([x, y]) => [cx + x * Math.cos(a) - y * Math.sin(a), cy + x * Math.sin(a) + y * Math.cos(a)] as Pt),
    4,
  );
};
export const lensPts = (cx: number, cy: number, w: number, h: number, rotDeg: number): Pt[] => {
  const n = 14;
  const right: Pt[] = [];
  const left: Pt[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const hw = (w / 2) * Math.pow(Math.sin(Math.PI * t), 0.85);
    const y = -h / 2 + h * t;
    right.push([hw, y]);
    left.push([-hw, y]);
  }
  const pts = [...right, ...left.reverse().slice(1, -1)];
  const a = (rotDeg * Math.PI) / 180;
  return pts.map(([x, y]) => [cx + x * Math.cos(a) - y * Math.sin(a), cy + x * Math.sin(a) + y * Math.cos(a)] as Pt);
};

// ---------------------------------------------------------------- texture
const TEX = 320;
const texSvg = (seed: number, speck: boolean) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${TEX}" height="${TEX}">` +
  `<filter id="a" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">` +
  `<feTurbulence type="fractalNoise" baseFrequency="0.6" numOctaves="4" seed="${seed}" stitchTiles="stitch"/>` +
  `<feDiffuseLighting surfaceScale="1.6" diffuseConstant="1" lighting-color="#fff"><feDistantLight azimuth="225" elevation="50"/></feDiffuseLighting>` +
  `<feColorMatrix type="matrix" values="0 0 0 0 0.24 0 0 0 0 0.17 0 0 0 0 0.08 -1.5 0 0 0 1.24"/></filter>` +
  `<filter id="b" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">` +
  `<feTurbulence type="fractalNoise" baseFrequency="0.006 0.12" numOctaves="3" seed="${seed + 7}" stitchTiles="stitch"/>` +
  `<feColorMatrix type="matrix" values="0 0 0 0 1 0 0 0 0 1 0 0 0 0 1 0 0 0 -4 1.9"/></filter>` +
  `<filter id="c" x="0" y="0" width="100%" height="100%" color-interpolation-filters="sRGB">` +
  `<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="1" seed="${seed + 3}" stitchTiles="stitch"/>` +
  `<feColorMatrix type="matrix" values="0 0 0 0 0.22 0 0 0 0 0.14 0 0 0 0 0.05 0 0 0 -14 4.7"/></filter>` +
  `<rect width="100%" height="100%" filter="url(#a)"/>` +
  `<rect width="100%" height="100%" filter="url(#b)" opacity="0.45"/>` +
  (speck ? `<rect width="100%" height="100%" filter="url(#c)" opacity="0.55"/>` : '') +
  `</svg>`;
const uri = (s: string) => 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s);
export const TEX_URIS = [uri(texSvg(4, false)), uri(texSvg(19, false)), uri(texSvg(33, true))];

/** Global SVG defs: paper textures, grid, small piece shadows. Render once. */
export const Defs: React.FC = () => (
  <svg width={0} height={0} style={{position: 'absolute'}}>
    <defs>
      {[0, 1, 2, 3].map((i) => (
        <pattern
          key={i}
          id={`hs-tex${i}`}
          patternUnits="userSpaceOnUse"
          width={TEX}
          height={TEX}
          patternTransform={`translate(${i * 113} ${i * 71}) rotate(${i * 90} 160 160)`}
        >
          <image href={TEX_URIS[i % 2]} width={TEX} height={TEX} />
        </pattern>
      ))}
      <pattern id="hs-kraft" patternUnits="userSpaceOnUse" width={TEX} height={TEX} patternTransform="translate(57 141)">
        <image href={TEX_URIS[2]} width={TEX} height={TEX} />
      </pattern>
      <pattern id="hs-grid" patternUnits="userSpaceOnUse" width={30} height={30}>
        <path d="M30 0H0V30" fill="none" stroke="#8FB0A5" strokeWidth={1.5} opacity={0.75} />
      </pattern>
      <filter id="hs-pshadow" x="-25%" y="-25%" width="150%" height="160%">
        <feDropShadow dx={1.3} dy={2.4} stdDeviation={1.4} floodColor="#2E200C" floodOpacity={0.34} />
      </filter>
      <filter id="hs-bshadow" x="-5%" y="-10%" width="110%" height="130%">
        <feDropShadow dx={0} dy={-2} stdDeviation={5} floodColor="#2E200C" floodOpacity={0.2} />
      </filter>
    </defs>
  </svg>
);

// ---------------------------------------------------------------- stop-motion poses
export type Pose = {on: boolean; x: number; y: number; rot: number; scale: number; lift: number};
export const OFF: Pose = {on: false, x: 0, y: 0, rot: 0, scale: 1, lift: 0};
export const REST: Pose = {on: true, x: 0, y: 0, rot: 0, scale: 1, lift: 0};
/** animate "on twos": hold each pose for `step` frames */
export const stepF = (f: number, step = 2) => Math.floor(f / step) * step;

type Move = {x?: number; y?: number; rot?: number};
export type PlaceOpts = {
  seed: string;
  enter: number;
  exit?: number;
  from: Move; // offset at the start of the entrance
  rest?: number; // resting rotation
  to?: Move; // offset at the end of the exit
  exitDur?: number;
  step?: number;
  liftAmt?: number;
  config?: {damping: number; stiffness: number; mass: number};
};

export const place = (frame: number, fps: number, o: PlaceOpts): Pose => {
  const step = o.step ?? 2;
  const f = stepF(frame, step);
  if (f < o.enter) return OFF;
  const t = f - o.enter;
  const p = spring({frame: t, fps, config: o.config ?? {damping: 15, stiffness: 150, mass: 0.85}});
  const pr = spring({frame: t - 2, fps, config: {damping: 12, stiffness: 120, mass: 0.9}});
  const la = o.liftAmt ?? 1;
  let x = (o.from.x ?? 0) * (1 - p);
  let y = (o.from.y ?? 0) * (1 - p);
  let rot = (o.rest ?? 0) + (o.from.rot ?? 0) * (1 - pr);
  let lift = Math.max(0, 1 - p * 1.08) * la;
  if (t < 20) {
    // imperfect hand placement while the piece is being adjusted
    const k = 1 - t / 20;
    x += (random(`${o.seed}x${f}`) - 0.5) * 2.6 * k;
    y += (random(`${o.seed}y${f}`) - 0.5) * 2.6 * k;
    rot += (random(`${o.seed}r${f}`) - 0.5) * 1.1 * k;
  }
  if (o.exit !== undefined && f >= o.exit) {
    const dur = o.exitDur ?? 12;
    const e = interpolate(f - o.exit, [0, dur], [0, 1], {
      extrapolateLeft: 'clamp',
      extrapolateRight: 'clamp',
      easing: Easing.in(Easing.cubic),
    });
    if (e >= 1) return OFF;
    x += (o.to?.x ?? 0) * e;
    y += (o.to?.y ?? 0) * e;
    rot += (o.to?.rot ?? 0) * e;
    lift = Math.max(lift, Math.min(1, (f - o.exit) / 4) * la);
  }
  return {on: true, x, y, rot, scale: 1 + 0.045 * lift, lift};
};

// ---------------------------------------------------------------- shadows & pieces
const f1 = (n: number) => n.toFixed(1);
export const shadowCss = (lift: number, k = 1) => {
  const l = Math.max(0, Math.min(1, lift));
  return (
    `drop-shadow(${f1((1.2 + 5 * l) * k)}px ${f1((2.2 + 14 * l) * k)}px ${f1((1.6 + 10 * l) * k)}px rgba(46,32,12,${(0.36 - 0.14 * l).toFixed(3)})) ` +
    `drop-shadow(${f1((3 + 9 * l) * k)}px ${f1((9 + 26 * l) * k)}px ${f1((12 + 20 * l) * k)}px rgba(46,32,12,${(0.14 + 0.06 * l).toFixed(3)}))`
  );
};

export const Piece: React.FC<{
  x: number;
  y: number;
  w: number;
  h: number;
  pose: Pose;
  shadow?: number;
  origin?: string;
  children: React.ReactNode;
}> = ({x, y, w, h, pose, shadow = 1, origin = '50% 50%', children}) => {
  if (!pose.on) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - w / 2,
        top: y - h / 2,
        width: w,
        height: h,
        transform: `translate(${pose.x.toFixed(2)}px, ${pose.y.toFixed(2)}px) rotate(${pose.rot.toFixed(3)}deg) scale(${pose.scale.toFixed(4)})`,
        transformOrigin: origin,
        filter: shadow > 0 ? shadowCss(pose.lift, shadow) : undefined,
      }}
    >
      {children}
    </div>
  );
};

/** A sheet of paper drawn in its own box coordinates (0..w, 0..h). */
export const PaperSvg: React.FC<{
  w: number;
  h: number;
  o: Outline;
  color: string;
  rim?: string | false;
  tex?: string | false;
  texOpacity?: number;
  pad?: number;
  children?: React.ReactNode;
  over?: React.ReactNode;
}> = ({w, h, o, color, rim, tex = 'hs-tex0', texOpacity = 0.6, pad = 30, children, over}) => (
  <svg
    width={w + pad * 2}
    height={h + pad * 2}
    viewBox={`${-pad} ${-pad} ${w + pad * 2} ${h + pad * 2}`}
    style={{position: 'absolute', left: -pad, top: -pad, overflow: 'visible'}}
  >
    {rim !== false && <path d={o.rim} fill={rim ?? rimOf(color)} />}
    <path d={o.d} fill={color} />
    {children}
    {tex && <path d={o.d} fill={`url(#${tex})`} opacity={texOpacity} />}
    {over}
  </svg>
);

/** small paper bit inside an SVG (icons etc.) */
export const Bit: React.FC<{o: Outline; color: string; rim?: boolean; shadow?: boolean; tex?: boolean}> = ({
  o,
  color,
  rim = true,
  shadow = true,
  tex = false,
}) => (
  <g filter={shadow ? 'url(#hs-pshadow)' : undefined}>
    {rim && <path d={o.rim} fill={rimOf(color)} />}
    <path d={o.d} fill={color} />
    {tex && <path d={o.d} fill="url(#hs-tex2)" opacity={0.5} />}
  </g>
);

/** translucent masking tape */
export const Tape: React.FC<{x: number; y: number; w?: number; rot: number; seed: string}> = ({x, y, w = 150, rot, seed}) => {
  const h = 46;
  const o = outlineRect(w, h, seed, ['cut', 'torn', 'cut', 'torn'], 0.8);
  return (
    <div style={{position: 'absolute', left: x - w / 2, top: y - h / 2, width: w, height: h, transform: `rotate(${rot}deg)`, opacity: 0.84, filter: 'drop-shadow(0.5px 1.5px 1px rgba(46,32,12,0.18))'}}>
      <PaperSvg w={w} h={h} o={o} color="#EBDDB2" rim={false} tex="hs-tex1" texOpacity={0.5} pad={10} />
    </div>
  );
};

// ---------------------------------------------------------------- text measuring (only after fonts are ready)
let ctx: CanvasRenderingContext2D | null = null;
const tw = new Map<string, number>();
export const textWidth = (text: string, font: string) => {
  const key = font + '|' + text;
  const hit = tw.get(key);
  if (hit !== undefined) return hit;
  if (!ctx) ctx = document.createElement('canvas').getContext('2d');
  ctx!.font = font;
  const v = ctx!.measureText(text).width;
  tw.set(key, v);
  return v;
};
