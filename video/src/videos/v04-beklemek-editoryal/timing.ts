// All timing for v04 lives here (absolute frames @30fps).
// Reading rule from the brief: each beat readable for >= 0.35 s x words + 1.2 s.

export const FPS = 30;

/** Duration of a page turn. */
export const TURN = 30;
/** Line rise (entry) duration and stagger. */
export const RISE = 28;
export const STAGGER = 6;
/** Line exit duration and stagger. */
export const EXIT = 20;
export const EXIT_STAGGER = 3;

export const T = {
  // ── Page 1 · opening pull quote (hook)
  kicker: -30,
  quote: 0, // line 1 is already set at frame 0; lines 2–4 follow
  capRule: 40,
  caption: 48,
  turn1: 186,

  // ── Page 2 · the essay
  b3: 220, // Kimi zaman gerçekten öyle olur.
  hourglass: 250,
  b4: 312, // Ama beklerken geçen aylar geri gelmez.
  underline: 354,
  p2Out: 452, // b3 + b4 + hourglass leave the column
  dropCap: 472,
  b5: 478, // paragraph with drop cap
  seedling: 530,
  turn2: 720,

  // ── Page 3 · the turn & the sign-off
  b6: 750, // Bir uzmana danışmak…
  b6Out: 986,
  b7: 1004, // Hiçbir liste…
  b7Out: 1150,
  b8: 1168, // İçinizdeki sesi ciddiye alın.
  circle: 1204,
  sig: 1270, // signature block
  turn3: 1414,

  // ── Back cover · brand outro
  end: 1500,
} as const;

export const DURATION = T.end;
