import {Easing, interpolate} from 'remotion';

export const FPS = 30;

/** Motion language: one family of curves used everywhere. */
export const EASE = {
  /** entrances – fast start, long soft landing (expo-like) */
  out: Easing.bezier(0.16, 1, 0.3, 1),
  /** exits – slow start, accelerating away */
  in: Easing.bezier(0.45, 0, 0.7, 0.4),
  /** colour-block wipes and pushes */
  inOut: Easing.bezier(0.83, 0, 0.17, 1),
  /** colour-block panels (gentler in-out so the accent band stays slim) */
  wipe: Easing.bezier(0.65, 0, 0.35, 1),
  /** gentle settle for secondary elements */
  soft: Easing.bezier(0.33, 1, 0.68, 1),
};

export const ramp = (f: number, start: number, dur: number, ease: (t: number) => number = EASE.out) =>
  interpolate(f, [start, start + Math.max(1, dur)], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: ease,
  });

/** Brief rule: each text beat stays fully readable ≥ 0.35 s × words + 1.2 s. */
export const readFrames = (words: number) => Math.ceil((0.35 * words + 1.2) * FPS);

export const countWords = (texts: string[]) =>
  texts
    .join(' ')
    .split(/\s+/)
    .filter((w) => /[A-Za-zÇĞİÖŞÜçğıöşü]/.test(w)).length;

/** All timing constants (frames @30fps). */
export const T = {
  RISE: 17, // a word rising out of its mask
  WORD: 2, // stagger between words of a line
  LINE: 2, // extra stagger when a new line starts
  LEGIBLE: 6, // frames after a word starts until it reads cleanly (expo-out ≈ 92 %)
  EXIT: 10, // words leaving upwards through their masks
  EXIT_LINE: 1.5, // exit stagger per line
  EXIT_LEAD: 4, // old content starts leaving this many frames before the next scene's wipe
  WIPE: 15, // colour-block panel travel
  WIPE_LAG: 2, // background panel trails the accent panel
  BUILD: 9, // local frame at which a scene's text starts building (wipe ≈ 75 % done)
  MARKER: 14, // orange marker block sweep
  NOTE_DELAY: 22, // small note starts this long after the main text is legible
  OUTRO: 100, // outro length
};

/** frames the outgoing scene must stay mounted after its exit begins */
export const TAIL = T.EXIT_LEAD + T.WIPE_LAG + T.WIPE + 1;
