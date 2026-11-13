// All timing for v05 lives here (frames @ 30 fps).
// Reading rule from the brief: each beat readable >= 0.35 s × words + 1.2 s.

export const FPS = 30;

// Hook (7 words → ≥ 3.65 s). Lines are readable by ~f28.
export const HOOK_IN = -6; // first line starts slightly before f0 so frame 0 is never empty
export const HOOK_OUT = 138;
export const FAN_IN = 4;

// Title cover card (6 words → ≥ 3.3 s). Lands ~f166.
export const GATHER = 150;
export const COVER_IN = 160;
export const COVER_OUT = 282;
export const COUNTER_IN = COVER_OUT + 10;

// The three myth → fact cards.
// myth readable from the moment the card above leaves; fact readable ~14 f after the flip starts.
export const FLIP = [398, 760, 1077] as const; // c1 myth 6w (≥99f), c2 7w (≥110f), c3 9w (≥131f)
export const OUT = [630, 926, 1295] as const; // c1 fact 17w (≥215f), c2 11w (≥152f), c3 16w (≥204f)
export const STRIKE_LEAD = 36; // strike starts this many frames before the flip
export const STAMP_DELAY = 19; // DOĞRU stamp lands after flip start
export const HL_DELAY = 30; // key-phrase highlight sweep after flip start

// Closing line + sources, then outro.
export const CLOSE_IN = OUT[2] + 8;
export const CLOSE_TEXT = OUT[2] + 12;
export const OUTRO = 1518;
export const BRAND_IN = OUTRO + 18;
export const END = 1632;
