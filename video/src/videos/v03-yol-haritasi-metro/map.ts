/** World geometry (map coordinates in px at zoom 1), trains and camera for v03. */
import {Easing, interpolate} from 'remotion';
import {getLength} from '@remotion/paths';
import {C} from '../../shared/brand';
import * as T from './timeline';

export type Pt = {x: number; y: number};
const p = (x: number, y: number): Pt => ({x, y});
const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------- colours ----------
export const DE_BLUE = '#4A7194';
const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
export const mix = (a: string, b: string, t: number) => {
  const A = hex(a);
  const B = hex(b);
  return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join('');
};
export const LINE = {G: C.green, TR: C.orange, DE: DE_BLUE, X: C.text2} as const;
export const GHOST = {
  G: mix(C.green, C.cream, 0.78),
  TR: mix(C.orange, C.cream, 0.6),
  DE: mix(DE_BLUE, C.cream, 0.7),
  X: mix(C.text2, C.cream, 0.72),
} as const;
export const TINT = {TR: mix(C.orange, '#FFFFFF', 0.82), DE: mix(DE_BLUE, '#FFFFFF', 0.86)} as const;
export const RIVER_C = '#DCE6E5';

// ---------- stations ----------
export const ST = {
  G0: p(190, 940),
  S1: p(190, 1620),
  S2: p(190, 2240),
  X: p(690, 3060),
  TR1: p(190, 4100),
  TR2: p(190, 4860),
  DE1: p(1190, 4100),
  DE2: p(1190, 4860),
  SPUR: p(690, 3640),
  TERM: p(690, 5600),
};
const G_PTS = [ST.G0, ST.S1, ST.S2, p(190, 2380), p(690, 2880), ST.X];
const TR_PTS = [p(630, 3060), p(630, 3300), p(190, 3740), ST.TR1, ST.TR2, p(190, 5160), p(630, 5600)];
const DE_PTS = [p(750, 3060), p(750, 3300), p(1190, 3740), ST.DE1, ST.DE2, p(1190, 5160), p(750, 5600)];

/** Polyline → SVG path with circular-arc rounded corners (metro-map style). */
export const roundedPath = (pts: Pt[], r = 110) => {
  let d = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const c = pts[i + 1];
    const l1 = Math.hypot(b.x - a.x, b.y - a.y);
    const l2 = Math.hypot(c.x - b.x, c.y - b.y);
    const v1 = {x: (b.x - a.x) / l1, y: (b.y - a.y) / l1};
    const v2 = {x: (c.x - b.x) / l2, y: (c.y - b.y) / l2};
    const cross = v1.x * v2.y - v1.y * v2.x;
    if (Math.abs(cross) < 1e-6) {
      d += ` L ${b.x} ${b.y}`;
      continue;
    }
    const theta = Math.acos(Math.max(-1, Math.min(1, v1.x * v2.x + v1.y * v2.y)));
    const t = Math.min(r * Math.tan(theta / 2), l1 / 2, l2 / 2);
    const rr = t / Math.tan(theta / 2);
    d += ` L ${(b.x - v1.x * t).toFixed(2)} ${(b.y - v1.y * t).toFixed(2)}`;
    d += ` A ${rr.toFixed(2)} ${rr.toFixed(2)} 0 0 ${cross > 0 ? 1 : 0} ${(b.x + v2.x * t).toFixed(2)} ${(b.y + v2.y * t).toFixed(2)}`;
  }
  const last = pts[pts.length - 1];
  return d + ` L ${last.x} ${last.y}`;
};

export const G_PATH = roundedPath(G_PTS);
export const TR_PATH = roundedPath(TR_PTS);
export const DE_PATH = roundedPath(DE_PTS);
export const RIVER_PATH = roundedPath([p(2500, 1550), p(1500, 2550), p(-700, 2550)], 300);
const lenTo = (pts: Pt[], i: number) => getLength(roundedPath(pts.slice(0, i + 1)));
export const LEN = {
  G: getLength(G_PATH),
  TR: getLength(TR_PATH),
  DE: getLength(DE_PATH),
  S1: lenTo(G_PTS, 1),
  S2: lenTo(G_PTS, 2),
  TR1: lenTo(TR_PTS, 3),
  TR2: lenTo(TR_PTS, 4),
  DE1: lenTo(DE_PTS, 3),
  DE2: lenTo(DE_PTS, 4),
};
export const SPUR_TOP = ST.X.y + 84;
export const SPUR_LEN = ST.SPUR.y - 30 - SPUR_TOP;

// ---------- trains ----------
const STOP = 74; // train centre stops this far before the station centre
const TE = Easing.bezier(0.6, 0, 0.3, 1);
const track = (f: number, keys: Array<[number, number]>) =>
  interpolate(
    f,
    keys.map((k) => k[0]),
    keys.map((k) => k[1]),
    {...CL, easing: TE},
  );
export const trainG = (f: number) =>
  track(f, [
    [T.D0, 84],
    [T.A1, LEN.S1 - STOP],
    [T.D1, LEN.S1 - STOP],
    [T.A2, LEN.S2 - STOP],
    [T.D2, LEN.S2 - STOP],
    [T.A3, LEN.G - 104],
  ]);
export const trainTR = (f: number) =>
  track(f, [
    [T.D3, 150],
    [T.A4, LEN.TR1 - STOP],
    [T.D4, LEN.TR1 - STOP],
    [T.A5, LEN.TR2 - STOP],
    [T.D8 + 2, LEN.TR2 - STOP],
    [T.A9, LEN.TR - 116],
  ]);
export const trainDE = (f: number) =>
  track(f, [
    [T.D5 - 30, 150],
    [T.A6, LEN.DE1 - STOP],
    [T.D6, LEN.DE1 - STOP],
    [T.A7, LEN.DE2 - STOP],
    [T.D8 + 2, LEN.DE2 - STOP],
    [T.A9, LEN.DE - 116],
  ]);

/** Ghost (planned) line reveal from the interchange during the split. */
export const branchLen = (f: number, total: number) =>
  interpolate(f, [T.BRANCH0, T.BRANCH1, T.BRANCH1 + 50], [0, 1500, total], {
    ...CL,
    easing: Easing.inOut(Easing.cubic),
  });
export const spurGhost = (f: number) =>
  interpolate(f, [T.BRANCH0 + 4, T.BRANCH1 - 4], [0, SPUR_LEN], {...CL, easing: Easing.inOut(Easing.cubic)});
export const spurPaint = (f: number) =>
  interpolate(f, [T.D7 + 18, T.A8 + 2], [0, SPUR_LEN], {...CL, easing: Easing.inOut(Easing.quad)});

// ---------- camera ----------
export type Cam = {wx: number; wy: number; sx: number; sy: number; z: number};
const at = (s: Pt, sx = 196, sy = 700, z = 1): Cam => ({wx: s.x, wy: s.y, sx, sy, z});
export const BBOX = {x0: 70, x1: 1960, y0: 250, y1: 6060};
const OVZ = Math.min(1000 / (BBOX.x1 - BBOX.x0), 1860 / (BBOX.y1 - BBOX.y0));
const OVER: Cam = {wx: (BBOX.x0 + BBOX.x1) / 2, wy: (BBOX.y0 + BBOX.y1) / 2, sx: 540, sy: 960, z: OVZ};
export const CAM = {
  hook: {wx: 540, wy: 960, sx: 540, sy: 960, z: 1} as Cam,
  S1: at(ST.S1),
  S2: at(ST.S2),
  X: at(ST.X, 214, 640),
  split: {wx: 690, wy: 3400, sx: 540, sy: 900, z: 0.72} as Cam,
  TR1: at(ST.TR1, 196, 680),
  TR2: at(ST.TR2),
  DE1: at(ST.DE1, 196, 680),
  DE2: at(ST.DE2, 196, 640),
  spur: at(ST.SPUR, 540, 600),
  term: at(ST.TERM, 520, 640),
  over: OVER,
  over2: {...OVER, z: OVZ * 0.93},
};
type Seg = {f0: number; f1: number; a: Cam; b: Cam; dip: number; linear?: boolean};
const SEGS: Seg[] = [
  {f0: T.D0, f1: T.A1, a: CAM.hook, b: CAM.S1, dip: 0.05},
  {f0: T.D1, f1: T.A2, a: CAM.S1, b: CAM.S2, dip: 0.05},
  {f0: T.D2, f1: T.A3, a: CAM.S2, b: CAM.X, dip: 0.08},
  {f0: T.SPLIT_ZOOM0, f1: T.SPLIT_ZOOM1, a: CAM.X, b: CAM.split, dip: 0},
  {f0: T.D3, f1: T.A4, a: CAM.split, b: CAM.TR1, dip: 0},
  {f0: T.D4, f1: T.A5, a: CAM.TR1, b: CAM.TR2, dip: 0.05},
  {f0: T.D5, f1: T.A6, a: CAM.TR2, b: CAM.DE1, dip: 0.42},
  {f0: T.D6, f1: T.A7, a: CAM.DE1, b: CAM.DE2, dip: 0.05},
  {f0: T.D7, f1: T.A8, a: CAM.DE2, b: CAM.spur, dip: 0.45},
  {f0: T.D8, f1: T.A9, a: CAM.spur, b: CAM.term, dip: 0.45},
  {f0: T.D9, f1: T.OV, a: CAM.term, b: CAM.over, dip: 0},
  {f0: T.OV, f1: T.END, a: CAM.over, b: CAM.over2, dip: 0, linear: true},
];
const CE = Easing.bezier(0.65, 0, 0.35, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const cameraAt = (f: number): Cam => {
  let cam = SEGS[0].a;
  for (const s of SEGS) {
    if (f < s.f0) break;
    if (f >= s.f1) {
      cam = s.b;
      continue;
    }
    const raw = (f - s.f0) / (s.f1 - s.f0);
    const t = s.linear ? raw : CE(raw);
    const z = lerp(s.a.z, s.b.z, t) * (1 - s.dip * Math.sin(Math.PI * t) ** 2);
    cam = {
      wx: lerp(s.a.wx, s.b.wx, t),
      wy: lerp(s.a.wy, s.b.wy, t),
      sx: lerp(s.a.sx, s.b.sx, t),
      sy: lerp(s.a.sy, s.b.sy, t),
      z,
    };
    break;
  }
  return cam;
};
export const camSvg = (c: Cam) => `translate(${c.sx} ${c.sy}) scale(${c.z}) translate(${-c.wx} ${-c.wy})`;
export const camCss = (c: Cam) => `translate(${c.sx}px, ${c.sy}px) scale(${c.z}) translate(${-c.wx}px, ${-c.wy}px)`;
