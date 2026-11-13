import {Easing, interpolate, spring} from 'remotion';
import {FPS} from './timing';

export type Pose = {
  x: number; // card centre (px, frame space)
  y: number;
  s: number; // 2D scale
  r: number; // 2D rotation (deg)
  ay: number; // 3D rotateY (deg) – 0 = front (myth), 180 = back (fact)
  blur: number; // depth-of-field blur (px)
  dark: number; // 0..1 shade for cards deeper in the stack
  op: number;
};

export type Prog = (df: number) => number;
export type Step = {at: number; to: Partial<Pose>; p: Prog};

export const clamp01 = (v: number) => Math.max(0, Math.min(1, v));

export const sp =
  (config: {damping?: number; stiffness?: number; mass?: number}): Prog =>
  (df) =>
    spring({frame: df, fps: FPS, config: {damping: 200, stiffness: 100, mass: 1, ...config}});

export const ez =
  (dur: number, easing: (t: number) => number = Easing.inOut(Easing.cubic)): Prog =>
  (df) =>
    interpolate(df, [0, dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});

/** Throw easing with a little anticipation (pulls back before flying off). */
export const THROW = Easing.bezier(0.45, -0.32, 0.72, 0.5);

/** Sequentially blend a pose through steps (each step lerps from the running pose to its target). */
export const poseAt = (frame: number, init: Pose, steps: Step[]): Pose => {
  const sorted = [...steps].sort((a, b) => a.at - b.at);
  let p: Pose = {...init};
  for (const st of sorted) {
    if (frame < st.at) break;
    const t = st.p(frame - st.at);
    const n: Pose = {...p};
    (Object.keys(st.to) as Array<keyof Pose>).forEach((k) => {
      const target = st.to[k] as number;
      n[k] = p[k] + (target - p[k]) * t;
    });
    p = n;
  }
  return p;
};

/** 0→1 over [a, a+dur] with easing, clamped. */
export const prog = (frame: number, a: number, dur: number, easing: (t: number) => number = Easing.out(Easing.cubic)) =>
  interpolate(frame, [a, a + dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp', easing});
