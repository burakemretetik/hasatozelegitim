import {Easing, spring} from 'remotion';

export const clamp01 = (t: number) => Math.max(0, Math.min(1, t));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Apple-like curves. */
export const EASE = {
  io: Easing.bezier(0.65, 0, 0.35, 1), // calm in-out (camera, big moves)
  glide: Easing.bezier(0.45, 0, 0.12, 1), // in-out with a long, soft landing
  out: Easing.bezier(0.16, 1, 0.3, 1), // expo-ish out (reveals)
  in: Easing.bezier(0.55, 0, 0.85, 0.25), // exits
  lin: (t: number) => t,
};
export type EaseName = keyof typeof EASE | 'snap' | 'settle';

export const ease = (name: EaseName, t: number, durFrames: number): number => {
  if (name === 'snap' || name === 'settle') {
    // spring stretched over the segment: 'snap' has a small, crisp overshoot (velcro bounce)
    const damping = name === 'snap' ? 11 : 17;
    return spring({
      frame: t * durFrames,
      fps: 30,
      config: {damping, stiffness: 190, mass: 0.85},
      durationInFrames: durFrames,
    });
  }
  return EASE[name](clamp01(t));
};

/** Progress 0..1 between frames a and b with easing. */
export const prog = (f: number, a: number, b: number, name: EaseName = 'io') => {
  if (f <= a) return 0;
  if (f >= b) return 1;
  return ease(name, (f - a) / (b - a), b - a);
};

/** 3D pose of an object. */
export type Pose = {
  x: number;
  y: number;
  z: number;
  rx: number;
  ry: number;
  rz: number;
  s: number;
  o: number;
  flip: number; // 0 = face up, 1 = flipped (rotateY +180)
  lift: number; // height above its shadow plane (px)
  sh: number; // shadow strength multiplier
};

export const POSE0: Pose = {x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0, s: 1, o: 1, flip: 0, lift: 0, sh: 1};
const KEYS: (keyof Pose)[] = ['x', 'y', 'z', 'rx', 'ry', 'rz', 's', 'o', 'flip', 'lift', 'sh'];

export type KF = Partial<Pose> & {
  f: number;
  /** easing of the segment that ENDS at this keyframe */
  e?: EaseName;
  /** parabolic arc of the segment ending here: positive = bulges upward (px) */
  arc?: number;
  /** sideways arc (px, positive = bulges right) */
  arcX?: number;
  /** extra lift bump in the middle of the segment (px) */
  hop?: number;
};

/** Evaluate a keyframe track (values carry forward when omitted). */
export const track = (kfs: KF[], f: number): Pose => {
  const states: Pose[] = [];
  let cur: Pose = {...POSE0};
  for (const k of kfs) {
    const next = {...cur};
    for (const key of KEYS) {
      const v = k[key];
      if (v !== undefined) next[key] = v;
    }
    cur = next;
    states.push(cur);
  }
  if (f <= kfs[0].f) return states[0];
  for (let i = 1; i < kfs.length; i++) {
    if (f < kfs[i].f) {
      const a = states[i - 1];
      const b = states[i];
      const k = kfs[i];
      const dur = k.f - kfs[i - 1].f;
      const t = (f - kfs[i - 1].f) / dur;
      const e = ease(k.e ?? 'io', t, dur);
      const out = {} as Pose;
      for (const key of KEYS) out[key] = lerp(a[key], b[key], e);
      // arcs use a clamped, smooth parameter so overshoot doesn't distort the path
      const pa = EASE.io(clamp01(t));
      const bump = 4 * pa * (1 - pa);
      if (k.arc) out.y -= k.arc * bump;
      if (k.arcX) out.x += k.arcX * bump;
      if (k.hop) out.lift += k.hop * bump;
      return out;
    }
  }
  return states[states.length - 1];
};

/** Smooth, deterministic "breathing" offset (no jitter). */
export const drift = (f: number, period: number, amp: number, phase = 0) =>
  Math.sin((f / period) * Math.PI * 2 + phase) * amp;
