import {Easing, interpolate, interpolateColors} from 'remotion';
import {C, FONT} from '../../shared/brand';

/** Palette: Hasat brand + one supporting muted terracotta (the Bauhaus "red"). */
export const COL = {
  paper: C.cream,
  ink: C.green,
  inkDeep: C.greenDeep,
  orange: C.orange,
  orangeDeep: C.orangeDeep,
  brick: '#B05A3E',
  panel: C.panel,
  sage: C.sage,
  text2: C.text2,
} as const;

export const FF = FONT.geometric; // Outfit everywhere – one family, weight contrast

/** Mechanical in-out (shapes sliding on the grid). */
export const EASE = Easing.bezier(0.65, 0, 0.35, 1);
/** Crisp out (type reveals, stamps). */
export const EASE_OUT = Easing.bezier(0.16, 1, 0.3, 1);
/** Strong in-out for wipes. */
export const EASE_WIPE = Easing.bezier(0.76, 0, 0.24, 1);

const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

/** Keyframed value with the same easing on every segment. */
export const kf = (f: number, input: number[], output: number[], easing = EASE) =>
  interpolate(f, input, output, {...CL, easing});

/** 0→1 progress from `start` over `dur` frames. */
export const prog = (f: number, start: number, dur: number, easing = EASE) =>
  interpolate(f, [start, start + dur], [0, 1], {...CL, easing});

export const mix = (t: number, a: string, b: string) => interpolateColors(t, [0, 1], [a, b]);

/* ---------- polar shape morphing (circle ↔ square ↔ triangle) ---------- */
export type ShapeKind = 'circle' | 'square' | 'triangle';
const N = 72; // 5° steps → square corners (45°) and triangle tips (−90°, 30°, 150°) are hit exactly

/** Radius of a shape (inscribed in a box of half-size r) along angle θ (radians, 0 = right, y down). */
const radiusAt = (kind: ShapeKind, r: number, th: number) => {
  if (kind === 'circle') return r;
  if (kind === 'square') return r / Math.max(Math.abs(Math.cos(th)), Math.abs(Math.sin(th)));
  // equilateral triangle pointing up, centroid at origin, circumradius R
  const R = r * 1.12;
  const verts = [-90, 30, 150].map((d) => [R * Math.cos((d * Math.PI) / 180), R * Math.sin((d * Math.PI) / 180)]);
  const dx = Math.cos(th);
  const dy = Math.sin(th);
  let best = Infinity;
  for (let i = 0; i < 3; i++) {
    const [ax, ay] = verts[i];
    const [bx, by] = verts[(i + 1) % 3];
    const ex = bx - ax;
    const ey = by - ay;
    const den = dx * ey - dy * ex;
    if (Math.abs(den) < 1e-9) continue;
    const t = (ax * ey - ay * ex) / den;
    const u = (ax * dy - ay * dx) / den;
    if (t > 0 && u >= -1e-6 && u <= 1 + 1e-6) best = Math.min(best, t);
  }
  return best;
};

/** SVG path for a morph between two shapes at t∈[0,1], centred on (cx,cy). */
export const morphPath = (a: ShapeKind, b: ShapeKind, t: number, cx: number, cy: number, r: number) => {
  let d = '';
  for (let i = 0; i < N; i++) {
    const th = -Math.PI / 2 + (i / N) * Math.PI * 2;
    const ra = radiusAt(a, r, th);
    const rb = radiusAt(b, r, th);
    const rr = ra + (rb - ra) * t;
    d += `${i === 0 ? 'M' : 'L'}${(cx + rr * Math.cos(th)).toFixed(2)} ${(cy + rr * Math.sin(th)).toFixed(2)}`;
  }
  return d + 'Z';
};
