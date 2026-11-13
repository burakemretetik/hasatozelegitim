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
  quote: -8, // first line already moving at frame 0
  capRule: 40,
  caption: 48,
  turn1: 186,

  // ── Page 2 · the essay
  b3: 220, // Kimi zaman gerçekten öyle olur.
  hourglass: 250,
  b4: 318, // Ama beklerken geçen aylar geri gelmez.
  underline: 360,
  p2Out: 464, // b3 + b4 + hourglass leave the column
  dropCap: 484,
  b5: 490, // paragraph with drop cap
  seedling: 540,
  turn2: 726,

  // ── Page 3 · the turn & the sign-off
  b6: 760, // Bir uzmana danışmak…
  b6Out: 982,
  b7: 1002, // Hiçbir liste…
  b7Out: 1146,
  b8: 1166, // İçinizdeki sesi ciddiye alın.
  circle: 1204,
  sig: 1270, // signature block
  turn3: 1414,

  // ── Back cover · brand outro
  end: 1500,
} as const;

export const DURATION = T.end;
