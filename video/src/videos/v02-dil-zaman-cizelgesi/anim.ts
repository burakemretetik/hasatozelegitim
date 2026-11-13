import {Easing} from 'remotion';

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

/** One consistent motion language for the whole piece. */
export const EASE = {
  /** arrivals: fast start, long soft settle */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  /** camera moves / travel along the axis */
  inOut: Easing.bezier(0.65, 0, 0.35, 1),
  /** departures */
  in: Easing.bezier(0.55, 0, 0.9, 0.4),
  /** gentle */
  soft: Easing.bezier(0.33, 1, 0.68, 1),
  linear: (t: number) => t,
};

/** eased 0→1 progress of a window that starts at `start` and lasts `dur` frames */
export const prog = (f: number, start: number, dur: number, ease: (t: number) => number = EASE.out) =>
  ease(clamp01((f - start) / Math.max(1, dur)));

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

type Key = [frame: number, value: number, ease?: (t: number) => number];

/** Piecewise keyframe interpolation; `ease` of a key is used for the segment that ends at it. */
export const kf = (f: number, keys: Key[]): number => {
  if (f <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    const [f1, v1, e] = keys[i];
    const [f0, v0] = keys[i - 1];
    if (f <= f1) {
      const t = f1 === f0 ? 1 : (f - f0) / (f1 - f0);
      return v0 + (v1 - v0) * (e ?? EASE.inOut)(t);
    }
  }
  return keys[keys.length - 1][1];
};

/** in → hold → out envelope (0..1) */
export const envelope = (f: number, inStart: number, inDur: number, outStart: number, outDur: number) =>
  Math.min(prog(f, inStart, inDur, EASE.out), 1 - prog(f, outStart, outDur, EASE.in));
