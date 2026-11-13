// Whiteboard doodles. Every function returns plain stroke descriptions (local coordinates).
import {C} from '../../shared/brand';
import {P, arrow, bubble, dot, ellipse, line, poly, scribbleCircle, smooth, wavy} from './rough';

export const INK = C.green;
export const RED = '#B4533C'; // muted terracotta (X, red ball)
export const LEAF = '#4A8A5C'; // muted leaf green (check mark)
export const BOARD = '#F7F8F4';

export type Stroke = {
  d: string;
  w?: number;
  c?: string;
  o?: number;
  fill?: string;
  speed?: number;
};

const S = (d: string, o: Partial<Stroke> = {}): Stroke => ({d, ...o});

export const house = (cx: number, by: number) => {
  const L = cx - 120;
  const R = cx + 120;
  const T = by - 165;
  return {
    walls: [S(poly([[L + 4, T - 4], [L, by], [R, by + 2], [R - 3, T - 2]], 'hw'))],
    roof: [S(poly([[L - 42, T + 12], [cx, T - 125], [R + 44, T + 14]], 'hr'))],
    chimney: [S(poly([[R - 48, T - 60], [R - 48, T - 102], [R - 14, T - 102], [R - 14, T - 32]], 'hc'))],
    door: [S(poly([[cx - 32, by], [cx - 30, by - 94], [cx + 32, by - 94], [cx + 30, by]], 'hd')), S(dot(cx + 18, by - 46), {w: 11})],
    windows: [
      S(poly([[L + 24, T + 36], [L + 80, T + 36], [L + 80, T + 90], [L + 24, T + 90]], 'hw1', true)),
      S(line([L + 52, T + 38], [L + 52, T + 88], 'hw2'), {w: 6}),
      S(poly([[R - 80, T + 36], [R - 24, T + 36], [R - 24, T + 90], [R - 80, T + 90]], 'hw3', true)),
      S(line([R - 52, T + 38], [R - 52, T + 88], 'hw4'), {w: 6}),
    ],
    heart: [
      S(
        `M${cx} ${T - 34} C${cx - 26} ${T - 52} ${cx - 16} ${T - 76} ${cx} ${T - 62} C${cx + 16} ${T - 76} ${cx + 26} ${T - 52} ${cx} ${T - 34}`,
        {c: C.orangeDeep, w: 6, fill: C.orange},
      ),
    ],
    bubbles: [
      S(bubble(cx - 236, T - 118, 96, 60, 0.95, [cx - 128, T - 30], 'hb1'), {c: C.orangeDeep}),
      S(wavy(cx - 296, cx - 176, T - 120, 9, 40, 'hq1'), {c: C.orange, w: 8}),
      S(bubble(cx + 240, T - 132, 96, 60, 2.2, [cx + 150, T - 28], 'hb2')),
      S(wavy(cx + 180, cx + 300, T - 134, 9, 40, 'hq2'), {c: LEAF, w: 8}),
    ],
  };
};

export const child = (hx: number, hy: number, seed: string) => ({
  head: [S(ellipse(hx, hy, 56, 54, seed + 'h'))],
  hair: [S(smooth([[hx - 24, hy - 50], [hx - 10, hy - 74], [hx + 12, hy - 76], [hx + 15, hy - 60], [hx + 2, hy - 57]]), {w: 7})],
  face: [
    S(dot(hx - 19, hy - 4), {w: 12}),
    S(dot(hx + 19, hy - 4), {w: 12}),
    S(smooth([[hx - 20, hy + 15], [hx, hy + 28], [hx + 20, hy + 15]]), {w: 7}),
    S(dot(hx - 36, hy + 14), {w: 22, c: C.orange, o: 0.55}),
    S(dot(hx + 36, hy + 14), {w: 22, c: C.orange, o: 0.55}),
  ],
  body: [
    S(poly([[hx - 20, hy + 56], [hx - 62, hy + 84], [hx - 64, hy + 218], [hx + 64, hy + 218], [hx + 62, hy + 84], [hx + 20, hy + 56]], seed + 'b')),
    S(smooth([[hx - 60, hy + 96], [hx - 88, hy + 138], [hx - 46, hy + 160]])),
    S(smooth([[hx + 60, hy + 96], [hx + 88, hy + 138], [hx + 46, hy + 160]])),
  ],
  ball: [S(ellipse(hx, hy + 152, 44, 44, seed + 'ball')), S(scribbleCircle(hx, hy + 152, 44, seed + 'bs'), {c: RED, w: 7, speed: 80})],
  legs: [
    S(poly([[hx - 28, hy + 218], [hx - 30, hy + 272], [hx - 52, hy + 276]], seed + 'l1')),
    S(poly([[hx + 28, hy + 218], [hx + 30, hy + 272], [hx + 52, hy + 276]], seed + 'l2')),
  ],
});

export const parent = (hx: number, hy: number, seed: string, mood: 'stern' | 'warm') => ({
  head: [S(ellipse(hx, hy, 64, 68, seed + 'h'))],
  hair: [
    S(smooth([[hx - 72, hy + 36], [hx - 80, hy - 26], [hx - 44, hy - 78], [hx + 8, hy - 87], [hx + 56, hy - 68], [hx + 82, hy - 22], [hx + 72, hy + 36]])),
    S(smooth([[hx - 62, hy - 30], [hx - 22, hy - 20], [hx + 16, hy - 46], [hx + 44, hy - 68]]), {w: 7}),
    S(ellipse(hx + 6, hy - 107, 26, 21, seed + 'bun')),
  ],
  face:
    mood === 'stern'
      ? [
          S(dot(hx - 22, hy + 4), {w: 12}),
          S(dot(hx + 22, hy + 4), {w: 12}),
          S(line([hx - 38, hy - 20], [hx - 12, hy - 10], seed + 'b1'), {w: 7}),
          S(line([hx + 38, hy - 20], [hx + 12, hy - 10], seed + 'b2'), {w: 7}),
          S(ellipse(hx, hy + 36, 9, 11, seed + 'm', {over: 0.12})),
        ]
      : [
          S(dot(hx - 22, hy + 2), {w: 12}),
          S(dot(hx + 22, hy + 2), {w: 12}),
          S(smooth([[hx - 26, hy + 24], [hx, hy + 42], [hx + 26, hy + 24]]), {w: 7}),
          S(dot(hx - 42, hy + 20), {w: 24, c: C.orange, o: 0.55}),
          S(dot(hx + 42, hy + 20), {w: 24, c: C.orange, o: 0.55}),
        ],
  body: [
    S(line([hx - 16, hy + 66], [hx - 17, hy + 98], seed + 'n1'), {w: 7}),
    S(line([hx + 16, hy + 66], [hx + 17, hy + 98], seed + 'n2'), {w: 7}),
    S(smooth([[hx - 114, hy + 252], [hx - 106, hy + 150], [hx - 64, hy + 104], [hx, hy + 97], [hx + 64, hy + 104], [hx + 106, hy + 150], [hx + 114, hy + 252]])),
  ],
});

/** Small face for the "conversation keeps flowing" doodle. */
export const smallHead = (hx: number, hy: number, r: number, seed: string, kind: 'child' | 'parent'): Stroke[] => [
  S(ellipse(hx, hy, r, r * 1.02, seed + 'h')),
  kind === 'child'
    ? S(smooth([[hx - r * 0.4, hy - r * 0.9], [hx - r * 0.15, hy - r * 1.3], [hx + r * 0.25, hy - r * 1.3], [hx + r * 0.25, hy - r * 1.05]]), {w: 6})
    : S(ellipse(hx + r * 0.1, hy - r * 1.45, r * 0.4, r * 0.32, seed + 'bun')),
  S(dot(hx - r * 0.33, hy - r * 0.05), {w: 11}),
  S(dot(hx + r * 0.33, hy - r * 0.05), {w: 11}),
  S(smooth([[hx - r * 0.38, hy + r * 0.3], [hx, hy + r * 0.55], [hx + r * 0.38, hy + r * 0.3]]), {w: 6}),
];

export const loopArrows = (cx: number, cy: number, r: number, seed: string): Stroke[] => {
  const arc = (a0: number, a1: number): P[] =>
    Array.from({length: 8}, (_, i) => {
      const a = a0 + ((a1 - a0) * i) / 7;
      return [cx + Math.cos(a) * r * 1.35, cy + Math.sin(a) * r] as P;
    });
  const [s1, h1] = arrow(arc(-2.75, -0.4), seed + 'a1', 22);
  const [s2, h2] = arrow(arc(0.39, 2.74), seed + 'a2', 22);
  return [S(s1, {c: C.orangeDeep}), S(h1, {c: C.orangeDeep}), S(s2, {c: C.orangeDeep}), S(h2, {c: C.orangeDeep})];
};

export const soundWaves = (x: number, y: number, seed: string): Stroke[] => [
  S(smooth([[x, y - 18], [x + 9, y], [x, y + 18]]), {w: 6}),
  S(smooth([[x + 16, y - 32], [x + 31, y], [x + 16, y + 32]]), {w: 6}),
];

export const sparkle = (x: number, y: number, k: number, seed: string, c: string = C.orange): Stroke[] => [
  S(line([x, y - 10 * k], [x, y - 36 * k], seed + 's1'), {c, w: 7}),
  S(line([x - 14 * k, y - 4 * k], [x - 34 * k, y - 18 * k], seed + 's2'), {c, w: 7}),
  S(line([x + 14 * k, y - 4 * k], [x + 34 * k, y - 18 * k], seed + 's3'), {c, w: 7}),
];

export const heartBubble = (x: number, y: number, k: number, seed: string): Stroke[] => [
  S(bubble(x, y - 6 * k, 64 * k, 48 * k, 2.25, [x - 48 * k, y + 64 * k], seed)),
  S(
    `M${x} ${y + 12 * k} C${x - 30 * k} ${y - 8 * k} ${x - 17 * k} ${y - 36 * k} ${x} ${y - 18 * k} C${x + 17 * k} ${y - 36 * k} ${x + 30 * k} ${y - 8 * k} ${x} ${y + 12 * k}`,
    {c: C.orangeDeep, w: 6, fill: C.orange},
  ),
];

export const bowl = (x: number, y: number, k: number, seed: string): Stroke[] => [
  S(line([x - 62 * k, y - 4 * k], [x + 62 * k, y - 4 * k], seed + 'r')),
  S(smooth([[x - 58 * k, y - 2 * k], [x - 44 * k, y + 30 * k], [x, y + 44 * k], [x + 44 * k, y + 30 * k], [x + 58 * k, y - 2 * k]])),
  S(line([x + 16 * k, y - 8 * k], [x + 46 * k, y - 56 * k], seed + 'sp'), {w: 7}),
  S(ellipse(x + 51 * k, y - 66 * k, 10 * k, 13 * k, seed + 'sh', {over: 0.15})),
  S(smooth([[x - 22 * k, y - 16 * k], [x - 32 * k, y - 36 * k], [x - 20 * k, y - 54 * k], [x - 28 * k, y - 72 * k]]), {w: 5, c: C.text2}),
];

export const tub = (x: number, y: number, k: number, seed: string): Stroke[] => [
  S(line([x - 70 * k, y - 10 * k], [x + 70 * k, y - 10 * k], seed + 'r')),
  S(smooth([[x - 64 * k, y - 8 * k], [x - 58 * k, y + 22 * k], [x - 38 * k, y + 38 * k], [x + 38 * k, y + 38 * k], [x + 58 * k, y + 22 * k], [x + 64 * k, y - 8 * k]])),
  S(line([x - 40 * k, y + 38 * k], [x - 47 * k, y + 54 * k], seed + 'f1'), {w: 7}),
  S(line([x + 40 * k, y + 38 * k], [x + 47 * k, y + 54 * k], seed + 'f2'), {w: 7}),
  S(poly([[x + 52 * k, y - 10 * k], [x + 52 * k, y - 52 * k], [x + 28 * k, y - 52 * k], [x + 28 * k, y - 42 * k]], seed + 'fa')),
  S(ellipse(x - 30 * k, y - 32 * k, 13 * k, 13 * k, seed + 'b1', {over: 0.15}), {w: 6, c: C.text2}),
  S(ellipse(x - 4 * k, y - 44 * k, 9 * k, 9 * k, seed + 'b2', {over: 0.15}), {w: 6, c: C.text2}),
  S(ellipse(x - 30 * k, y - 64 * k, 7 * k, 7 * k, seed + 'b3', {over: 0.15}), {w: 6, c: C.text2}),
];

export const shirt = (x: number, y: number, k: number, seed: string): Stroke[] => [
  S(
    poly(
      [
        [x - 22 * k, y - 42 * k],
        [x - 56 * k, y - 30 * k],
        [x - 74 * k, y - 4 * k],
        [x - 52 * k, y + 8 * k],
        [x - 42 * k, y - 4 * k],
        [x - 42 * k, y + 46 * k],
        [x + 42 * k, y + 46 * k],
        [x + 42 * k, y - 4 * k],
        [x + 52 * k, y + 8 * k],
        [x + 74 * k, y - 4 * k],
        [x + 56 * k, y - 30 * k],
        [x + 22 * k, y - 42 * k],
      ],
      seed,
      false,
      0.04,
    ),
  ),
  S(smooth([[x - 22 * k, y - 42 * k], [x, y - 26 * k], [x + 22 * k, y - 42 * k]])),
];

export const book = (x: number, y: number, k: number, seed: string): Stroke[] => [
  S(poly([[x, y - 30 * k], [x - 34 * k, y - 44 * k], [x - 70 * k, y - 36 * k], [x - 70 * k, y + 30 * k], [x - 34 * k, y + 22 * k], [x, y + 34 * k]], seed + 'l')),
  S(poly([[x, y - 30 * k], [x + 34 * k, y - 44 * k], [x + 70 * k, y - 36 * k], [x + 70 * k, y + 30 * k], [x + 34 * k, y + 22 * k], [x, y + 34 * k]], seed + 'r')),
  S(line([x, y - 30 * k], [x, y + 34 * k], seed + 's')),
  S(line([x - 56 * k, y - 18 * k], [x - 14 * k, y - 16 * k], seed + 't1'), {w: 5}),
  S(line([x - 56 * k, y], [x - 14 * k, y + 2 * k], seed + 't2'), {w: 5}),
  S(line([x + 14 * k, y - 16 * k], [x + 56 * k, y - 18 * k], seed + 't3'), {w: 5}),
  S(line([x + 14 * k, y + 2 * k], [x + 56 * k, y], seed + 't4'), {w: 5}),
];

export const note = (x: number, y: number, k: number, seed: string): Stroke[] => [
  S(ellipse(x - 26 * k, y + 30 * k, 15 * k, 11 * k, seed + 'n1', {over: 0.12}), {fill: INK}),
  S(line([x - 12 * k, y + 28 * k], [x - 12 * k, y - 34 * k], seed + 's1')),
  S(ellipse(x + 30 * k, y + 22 * k, 15 * k, 11 * k, seed + 'n2', {over: 0.12}), {fill: INK}),
  S(line([x + 44 * k, y + 20 * k], [x + 44 * k, y - 42 * k], seed + 's2')),
  S(line([x - 12 * k, y - 34 * k], [x + 44 * k, y - 42 * k], seed + 'bm'), {w: 13}),
];

export const check = (x: number, y: number, k: number, seed: string): Stroke[] => [
  S(poly([[x, y], [x + 44 * k, y + 46 * k], [x + 132 * k, y - 76 * k]], seed, false, 0.04), {c: LEAF, w: 17, speed: 30}),
];

export const xMark = (x0: number, y0: number, x1: number, y1: number, seed: string): Stroke[] => [
  S(line([x0, y0], [x1, y1], seed + '1', 0.04), {c: RED, w: 12, o: 0.82, speed: 55}),
  S(line([x1, y0 - 6], [x0, y1 + 4], seed + '2', 0.04), {c: RED, w: 12, o: 0.82, speed: 55}),
];

export const ghostScribbles = (): Stroke[] => {
  // faint residue of earlier, erased writing on the whiteboard (canvas coordinates)
  const spots: Array<[number, number, number]> = [
    [260, 1180, 300],
    [1500, 1130, 260],
    [1350, 2850, 320],
    [180, 3120, 260],
    [1550, 3420, 300],
    [700, 2050, 200],
    [1650, 520, 280],
    [140, 640, 220],
  ];
  return spots.map(([x, y, w], i) => S(wavy(x, x + w, y, 14, 46, 'g' + i), {w: 9, o: 0.03}));
};
