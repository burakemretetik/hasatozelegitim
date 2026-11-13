/**
 * v03 timing (30 fps). Every text beat is held for at least 0.35 s × words + 1.2 s (rf()).
 * A = train/camera arrival, D = departure. Labels become readable IN frames before arrival
 * (the camera is already decelerating) and stay readable OUT frames into the next move.
 */
export const FPS = 30;
export const rf = (words: number) => Math.ceil((0.35 * words + 1.2) * FPS);
export const IN = 6;
export const OUT = 14;

const HOP = 28;
const HOP_X = 32;
const SWOOP = 42;
const FLIGHT = 40;
const FLIGHT_T = 42;
const OVER = 42;

// Hook (map title)
export const TITLE_READY = 14;
export const SUB_START = 20;
export const SUB_READY = 34;
export const D0 = Math.max(TITLE_READY + rf(9), SUB_READY + rf(3)) - OUT;

// S1 – Not alın (+ three questions)
export const A1 = D0 + HOP;
export const P1_READY = A1 + 20;
export const D1 = Math.max(A1 - IN + rf(8), P1_READY + rf(6)) - OUT;

// S2 – Kısa videolar çekin
export const A2 = D1 + HOP;
export const D2 = A2 - IN + rf(3) - OUT;

// X – interchange, then the split reveal
export const A3 = D2 + HOP_X;
export const SPLIT_ZOOM0 = A3 + 12;
export const SPLIT_ZOOM1 = SPLIT_ZOOM0 + 40;
export const BRANCH0 = A3 + 16;
export const BRANCH1 = BRANCH0 + 40;
export const TRAINS_POP = BRANCH1 - 8;
export const D3 = Math.max(A3 - IN + rf(3) - OUT, TRAINS_POP + 14);

// TR1 – Aile hekimi (+ panel + note)
export const A4 = D3 + SWOOP;
export const P4_READY = A4 + 8;
export const N4_START = Math.max(A4 - IN + rf(12), P4_READY + rf(10)) - 12;
export const N4_READY = N4_START + 12;
export const D4 = N4_READY + rf(6) - OUT;

// TR2 – Gerekirse: çocuk ve ergen ruh sağlığı uzmanı
export const A5 = D4 + HOP;
export const D5 = A5 - IN + rf(7) - OUT;

// DE1 – Kinderarzt (+ panel)   (flight across the map)
export const A6 = D5 + FLIGHT;
export const P6_READY = A6 + 8;
export const D6 = Math.max(A6 - IN + rf(8), P6_READY + rf(5)) - OUT;

// DE2 – SPZ … (+ note)
export const A7 = D6 + HOP;
export const N7_START = A7 - IN + rf(11) - 12;
export const N7_READY = N7_START + 12;
export const D7 = N7_READY + rf(7) - OUT;

// Spur – Diğer ülkeler
export const A8 = D7 + FLIGHT;
export const C8_READY = A8 + 6;
export const D8 = C8_READY + rf(7) - OUT;

// Terminal
export const A9 = D8 + FLIGHT_T;
export const S9_READY = A9 + 10;
export const D9 = S9_READY + rf(8) - OUT;

// Overview, closing line, outro
export const OV = D9 + OVER;
export const CL_START = OV + 12; // hold the full overview first
export const CL_READY = CL_START + 14;
export const CL_END = CL_READY + rf(12);
export const OUTRO = CL_END + 8;
export const OUTRO_TEXT_READY = OUTRO + 26;
export const END = OUTRO_TEXT_READY + rf(3) + 4;

// HUD (current line indicator)
export const HUD_G = A1 + 24;
export const HUD_TR = D3 + 10;
export const HUD_DE = D5 + 12;
export const HUD_OUT = D7 + 6;
