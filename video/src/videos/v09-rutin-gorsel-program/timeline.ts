// All timing (frames @30fps) and layout constants for v09 in one place.

export const DURATION = 1500;

/** Beat windows (overlaps = transitions). */
export const B = {
  hook: [0, 160],
  title: [160, 296],
  s1: [292, 504],
  s2: [500, 690],
  s3: [686, 924],
  s4: [920, 1134],
  tip: [1130, 1394],
  outro: [1390, 1500],
} as const;

/** Content centre (safe zone is asymmetric: left 80, right 140). */
export const CX = 510;
export const SAFE_L = 80;
export const SAFE_W = 860;

/** Base card size; everything else is a scale of it. */
export const CARD_W = 280;
export const CARD_H = 350;
export const CARD_T = 7; // thickness

/** Schedule strip. */
export const STRIP_Y = 1190;
export const STRIP_S = 0.664; // card scale on the strip (186 x 232)
export const PITCH = 206;
export const CARD_DY = -12; // cards sit a little above strip centre (marker lives below)
export const STRIP_H = 316;
export const slotX = (i: number, n: number) => CX + (i - (n - 1) / 2) * PITCH;
export const stripW = (n: number) => (n - 1) * PITCH + CARD_W * STRIP_S + 2 * 28;
export const SLOT_Y = STRIP_Y + CARD_DY;

/** Önce–sonra board. */
export const BOARD2 = {y: 1160, w: 860, h: 580, cardS: 1.12, slotDx: 204, cardDy: 46, chipDy: -222};

/** Caption block. */
export const CAP_TOP = 368;

/** Header chip states. */
export const CHIP_STATES: {f: number; label: string; kind: 'plain' | 'step' | 'tip'; n?: number}[] = [
  {f: 166, label: '4 adım', kind: 'plain'},
  {f: 298, label: 'Adım', kind: 'step', n: 1},
  {f: 506, label: 'Adım', kind: 'step', n: 2},
  {f: 692, label: 'Adım', kind: 'step', n: 3},
  {f: 926, label: 'Adım', kind: 'step', n: 4},
  {f: 1136, label: 'İpucu', kind: 'tip'},
];
export const HEADER_OUT = 1384;
