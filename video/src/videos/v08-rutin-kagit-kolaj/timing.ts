// All timing for v08 (30 fps). Paper pieces animate "on twos" (see paper.tsx).
export const T = {
  hook: {enter: -6, exit: 140},
  rutin: {enter: 146, card: 158, tear: 216, exit: 268},
  cerceve: {enter: 274, frame: 300, exit: 406},
  saat: {enter: 412, clock: 418, drop: 464, exit: 520},
  ana: {enter: 526, exit: 698},
  anchors: {strings: 702, sunRise: 708, tags: [732, 776, 820, 864, 908, 952]},
  weekend: {lift: 1044, flip: 1046, pull: 1046, enter: 1066, exit: 1208},
  closing: {enter: 1214, part: 1238, wheat: 1242, exit: 1340},
  outro: {garlandOut: 1336, card: 1346, strip: 1358, end: 1450},
} as const;

export const STAGGER = 4; // frames between strips of one text beat
export const DUSK = T.anchors.tags[4] - 6;
export const NIGHT = T.anchors.tags[5] - 10;
export const FLIP = T.anchors.tags[5] - 4;
export const SUN_SWITCH = T.anchors.sunRise + 18; // sun moves from behind the hills to the front sky layer
export const DURATION = T.outro.end;
