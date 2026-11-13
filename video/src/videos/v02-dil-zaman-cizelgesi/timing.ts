// All timing + layout constants for v02 in one place.
export const FPS = 30;
/** minimum readable time per the brief: 0.35 s × words + 1.2 s */
export const need = (words: number) => Math.ceil((0.35 * words + 1.2) * FPS);

// ---- layout ----
export const ANCHOR = 740; // screen y of the "you are here" reading line
export const AX = 160; // screen x of the vertical age axis
export const COL = 216; // left edge of the data column (cards, counter)
export const COL_R = 940; // right edge of the safe zone
export const HEAD_X = 96; // left edge of headlines
export const RULER = {x: 96, y: 1160, S: 34}; // hook: horizontal ruler under the title
export const S_OVER = 30; // px per month in overview
export const S_ZOOM = 120; // px per month when reading a milestone
export const HER_F = 11.4; // camera focus month for the "her yaşta" overview

// ---- beats ----
const hookFull = 24;
const hookOut = hookFull + need(7);
const b2In = hookOut + 12;
const b2Full = b2In + 5 + 18;
const b2Out = b2Full + need(6);

export type Ms = {month: number; ts: number; te: number; textIn: number; full: number; out: number};
const mk = (month: number, start: number, travel: number, nLines: number, words: number): Ms => {
  const te = start + travel;
  const textIn = te - 4;
  const full = textIn + 3 * (nLines - 1) + 14;
  return {month, ts: start, te, textIn, full, out: full + need(words)};
};

const m12 = mk(12, b2Out + 4, 32, 4, 11);
const m16 = mk(16, m12.out + 6, 22, 2, 6);
const m24 = mk(24, m16.out + 6, 26, 3, 9);
const her = mk(0, m24.out + 6, 36, 4, 13);

const warnIn = her.out;
const warnFull = warnIn + 46;
const warnOut = warnFull + need(20);

const closeIn = warnOut + 18;
const closeFull = closeIn + 8 + 16;
const closeOut = closeFull + need(7);
const outro = closeOut;

export const T = {
  hook: {full: hookFull, out: hookOut},
  swing: [hookOut + 2, hookOut + 40] as const,
  b2: {in: b2In, full: b2Full, out: b2Out},
  ms: [m12, m16, m24] as const,
  her,
  warn: {in: warnIn, full: warnFull, out: warnOut},
  close: {in: closeIn, full: closeFull, out: closeOut, cam0: warnOut, cam1: warnOut + 36, rows: warnOut + 12},
  outro,
  total: outro + 108,
};
