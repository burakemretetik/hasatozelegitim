// Deterministic "hand-drawn" path helpers (marker-on-whiteboard look).
import {random} from 'remotion';

export type P = [number, number];

export const rng = (seed: string) => {
  let i = 0;
  return () => random(`${seed}:${i++}`);
};

const n1 = (v: number) => String(Math.round(v * 10) / 10);
const pt = (p: P) => `${n1(p[0])} ${n1(p[1])}`;

/** Catmull-Rom spline through points -> cubic bezier path. */
export const smooth = (pts: P[], closed = false): string => {
  if (pts.length < 2) return '';
  const p = closed ? [pts[pts.length - 1], ...pts, pts[0], pts[1]] : [pts[0], ...pts, pts[pts.length - 1]];
  let d = `M${pt(p[1])}`;
  for (let i = 1; i < p.length - 2; i++) {
    const [p0, p1, p2, p3] = [p[i - 1], p[i], p[i + 1], p[i + 2]];
    const c1: P = [p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6];
    const c2: P = [p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6];
    d += ` C${pt(c1)} ${pt(c2)} ${pt(p2)}`;
  }
  return d;
};

export const jitter = (pts: P[], amt: number, seed: string): P[] => {
  const r = rng(seed);
  return pts.map(([x, y]) => [x + (r() - 0.5) * 2 * amt, y + (r() - 0.5) * 2 * amt]);
};

/** A slightly bowed straight-ish line. */
export const line = (a: P, b: P, seed: string, bow = 0.03): string => {
  const r = rng(seed);
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy) || 1;
  const k = (r() - 0.5) * 2 * bow * len;
  const m: P = [(a[0] + b[0]) / 2 - (dy / len) * k, (a[1] + b[1]) / 2 + (dx / len) * k];
  return `M${pt(a)} Q${pt(m)} ${pt(b)}`;
};

/** Polyline made of gently bowed segments (one continuous stroke). */
export const poly = (pts: P[], seed: string, closed = false, bow = 0.025): string => {
  const r = rng(seed);
  const all = closed ? [...pts, pts[0]] : pts;
  let d = `M${pt(all[0])}`;
  for (let i = 1; i < all.length; i++) {
    const a = all[i - 1];
    const b = all[i];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = Math.hypot(dx, dy) || 1;
    const k = (r() - 0.5) * 2 * bow * len;
    const m: P = [(a[0] + b[0]) / 2 - (dy / len) * k, (a[1] + b[1]) / 2 + (dx / len) * k];
    d += ` Q${pt(m)} ${pt(b)}`;
  }
  if (closed && pts.length > 1) {
    const a = pts[0];
    const b = pts[1];
    d += ` L${pt([a[0] + (b[0] - a[0]) * 0.07, a[1] + (b[1] - a[1]) * 0.07])}`;
  }
  return d;
};

/** Hand-drawn ellipse with overshoot (the loop doesn't close perfectly). */
export const ellipse = (
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  seed: string,
  o: {start?: number; over?: number; wob?: number} = {},
): string => {
  const r = rng(seed);
  const start = o.start ?? -Math.PI * 0.65 + (r() - 0.5) * 0.6;
  const over = o.over ?? 0.32;
  const wob = o.wob ?? 0.03;
  const ph1 = r() * 6.28;
  const ph2 = r() * 6.28;
  const N = 26;
  const pts: P[] = [];
  for (let i = 0; i <= N; i++) {
    const t = i / N;
    const th = start + t * (Math.PI * 2 + over);
    const k = 1 + wob * (Math.sin(2 * th + ph1) * 0.6 + Math.sin(3 * th + ph2) * 0.4) - 0.045 * t;
    pts.push([cx + Math.cos(th) * rx * k, cy + Math.sin(th) * ry * k]);
  }
  return smooth(pts);
};

const superPt = (cx: number, cy: number, a: number, b: number, t: number, k: number, e: number): P => {
  const c = Math.cos(t);
  const s = Math.sin(t);
  return [cx + a * k * Math.sign(c) * Math.pow(Math.abs(c), e), cy + b * k * Math.sign(s) * Math.pow(Math.abs(s), e)];
};

/** Rounded speech bubble (super-ellipse) with a pointed tail; tail sits at parameter angle tailT. */
export const bubble = (cx: number, cy: number, a: number, b: number, tailT: number, tip: P, seed: string, delta = 0.2): string => {
  const r = rng(seed);
  const ph = r() * 6.28;
  const N = 46;
  const t0 = tailT + delta;
  const t1 = tailT - delta + Math.PI * 2;
  const pts: P[] = [];
  for (let i = 0; i <= N; i++) {
    const t = t0 + ((t1 - t0) * i) / N;
    pts.push(superPt(cx, cy, a, b, t, 1 + 0.015 * Math.sin(3 * t + ph), 0.45));
  }
  return `${smooth(pts)} L${pt(tip)} L${pt(pts[0])}`;
};

/** Closed rounded frame (no tail) with overshoot. */
export const frame = (cx: number, cy: number, a: number, b: number, seed: string, e = 0.3): string => {
  const r = rng(seed);
  const ph = r() * 6.28;
  const start = -2.2 + r() * 0.3;
  const N = 60;
  const pts: P[] = [];
  for (let i = 0; i <= N; i++) {
    const tt = i / N;
    const t = start + tt * (Math.PI * 2 + 0.22);
    pts.push(superPt(cx, cy, a, b, t, 1 + 0.012 * Math.sin(3 * t + ph) - 0.012 * tt, e));
  }
  return smooth(pts);
};

/** Marker "colouring in" of a circle: one continuous zig-zag stroke. */
export const scribbleCircle = (cx: number, cy: number, rad: number, seed: string, gap = 12, ang = -0.75): string => {
  const r = rng(seed);
  const ux = Math.cos(ang);
  const uy = Math.sin(ang);
  const vx = -uy;
  const vy = ux;
  const pts: P[] = [];
  let flip = false;
  for (let o = -rad * 0.8; o <= rad * 0.8; o += gap) {
    const half = Math.sqrt(Math.max(0, rad * rad * 0.74 - o * o));
    const a: P = [cx + vx * o - ux * half, cy + vy * o - uy * half];
    const b: P = [cx + vx * o + ux * half, cy + vy * o + uy * half];
    if (flip) pts.push(b, a);
    else pts.push(a, b);
    flip = !flip;
  }
  return 'M' + pts.map((p) => pt([p[0] + (r() - 0.5) * 3, p[1] + (r() - 0.5) * 3])).join(' L');
};

export const wavy = (x0: number, x1: number, y: number, amp: number, period: number, seed: string): string => {
  const r = rng(seed);
  const n = Math.max(2, Math.round((x1 - x0) / (period / 4)));
  const pts: P[] = [];
  for (let i = 0; i <= n; i++) {
    pts.push([x0 + ((x1 - x0) * i) / n, y + Math.sin((i * Math.PI) / 2) * amp + (r() - 0.5) * 2]);
  }
  return smooth(pts);
};

/** Curved arrow: [shaft, head]. */
export const arrow = (pts: P[], seed: string, head = 26): [string, string] => {
  const shaft = smooth(jitter(pts, 2, seed));
  const [x1, y1] = pts[pts.length - 1];
  const [x0, y0] = pts[pts.length - 2];
  const ang = Math.atan2(y1 - y0, x1 - x0);
  const a1 = ang + Math.PI - 0.5;
  const a2 = ang + Math.PI + 0.5;
  const h = `M${pt([x1 + Math.cos(a1) * head, y1 + Math.sin(a1) * head])} L${pt([x1, y1])} L${pt([
    x1 + Math.cos(a2) * head,
    y1 + Math.sin(a2) * head,
  ])}`;
  return [shaft, h];
};

export const dot = (x: number, y: number): string => `M${n1(x)} ${n1(y)} l0.3 0.4`;
