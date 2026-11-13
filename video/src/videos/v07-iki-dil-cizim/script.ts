// The whole sketchnote: layout (per "space") + timing. Timing is derived from text length / path
// length so every text beat automatically gets its reading time (0.35 s/word + 1.2 s).
import {Easing, interpolate} from 'remotion';
import {getLength} from '@remotion/paths';
import {C} from '../../shared/brand';
import * as D from './doodles';
import {INK, RED, Stroke} from './doodles';
import {P, arrow, frame, wavy} from './rough';

export const FPS = 30;

// ---------- spaces: each section is authored in "screen pixels at its own camera zoom" ----------
export type SpaceId = 'board' | 'head' | 'colL' | 'colR' | 'close' | 'out';
export const SPACES: Record<SpaceId, {ox: number; oy: number; s: number}> = {
  board: {ox: 0, oy: 0, s: 1},
  head: {ox: 410, oy: -30, s: 1},
  colL: {ox: 43.3, oy: 1230, s: 1 / 1.2},
  colR: {ox: 943.3, oy: 1230, s: 1 / 1.2},
  close: {ox: 353, oy: 2470, s: 1 / 0.9},
  out: {ox: 380, oy: 4300, s: 1},
};
export const toCanvas = (space: SpaceId, p: P): P => {
  const s = SPACES[space];
  return [s.ox + p[0] * s.s, s.oy + p[1] * s.s];
};

// ---------- items ----------
type Base = {space: SpaceId; start: number; dur: number; pen: boolean};
export type StrokeItem = Base & {
  kind: 'stroke';
  d: string;
  len: number;
  w: number;
  c: string;
  o: number;
  fill?: string;
  under?: boolean;
  cap?: 'round' | 'butt';
  blend?: boolean;
};
export type TextItem = Base & {
  kind: 'text';
  id: string;
  text: string;
  x: number;
  y: number;
  size: number;
  weight: number;
  c: string;
  anchor: 'start' | 'middle';
  maxW: number;
};
export type HlItem = Base & {kind: 'hl'; of: string; sub: string; style: 'marker' | 'underline'; c: string};
export type LogoItem = Base & {kind: 'logo'; x: number; y: number; w: number};
export type Item = StrokeItem | TextItem | HlItem | LogoItem;

export const R = (words: number) => Math.ceil((0.35 * words + 1.2) * FPS); // reading time (frames)
const words = (...lines: string[]) => lines.join(' ').split(/\s+/).filter(Boolean).length;

class Script {
  t = 0;
  items: Item[] = [];
  space: SpaceId = 'head';
  in(space: SpaceId) {
    this.space = space;
    return this;
  }
  at(t: number) {
    this.t = t;
    return this;
  }
  wait(n: number) {
    this.t += n;
    return this;
  }
  text(
    id: string,
    text: string,
    x: number,
    y: number,
    size: number,
    o: {weight?: number; anchor?: 'start' | 'middle'; maxW?: number; cps?: number; gap?: number; c?: string} = {},
  ) {
    const dur = Math.max(7, Math.round(text.length / (o.cps ?? 1.8)));
    this.items.push({
      kind: 'text',
      id,
      text,
      x,
      y,
      size,
      weight: o.weight ?? 600,
      c: o.c ?? INK,
      anchor: o.anchor ?? 'start',
      maxW: o.maxW ?? 860,
      space: this.space,
      start: this.t,
      dur,
      pen: true,
    });
    this.t += dur + (o.gap ?? 3);
    return this;
  }
  draw(strokes: Stroke[], o: {speed?: number; gap?: number; pen?: boolean; at?: number; max?: number} = {}) {
    let t = o.at ?? this.t;
    for (const s of strokes) {
      const len = getLength(s.d);
      const dur = Math.max(3, Math.min(o.max ?? 16, Math.round(len / (s.speed ?? o.speed ?? 60))));
      this.items.push({
        kind: 'stroke',
        d: s.d,
        len,
        w: s.w ?? 8,
        c: s.c ?? INK,
        o: s.o ?? 1,
        fill: s.fill,
        space: this.space,
        start: t,
        dur,
        pen: o.pen ?? true,
      });
      t += dur + (o.gap ?? 1);
    }
    if (o.at === undefined) this.t = t;
    return this;
  }
  hl(of: string, sub: string, at: number, o: {dur?: number; style?: 'marker' | 'underline'; c?: string} = {}) {
    this.items.push({
      kind: 'hl',
      of,
      sub,
      style: o.style ?? 'marker',
      c: o.c ?? C.orange,
      space: this.space,
      start: at,
      dur: o.dur ?? 10,
      pen: false,
    });
    return this;
  }
}

// ---------- camera stops ----------
export type Stop = {x: number; y: number; z: number; arrive: number; leave: number};
const stopAt = (space: SpaceId, lx: number, ly: number, arrive: number, leave: number): Stop => {
  const [x, y] = toCanvas(space, [lx, ly]);
  return {x, y, z: 1 / SPACES[space].s, arrive, leave};
};

const EARLY = 10; // the move may start this many frames before the reading time is fully over
const PAN = 22;
const PAN_LONG = 34;

const s = new Script();
const stops: Stop[] = [];

// ===== S1 · Title + house =====
s.in('head').at(-5);
s.text('t1', 'Evde iki dil:', 510, 790, 196, {weight: 700, anchor: 'middle', cps: 0.95});
s.text('t2', 'küçük ama etkili', 510, 950, 132, {weight: 700, anchor: 'middle', cps: 1.15});
s.text('t3', 'bir ipucu', 510, 1085, 132, {weight: 700, anchor: 'middle', cps: 1.15});
const r1 = s.t;
s.hl('t2', 'etkili', r1, {dur: 9});
s.wait(3);
{
  const h = D.house(510, 545);
  s.draw([...h.roof, ...h.walls, ...h.chimney, ...h.door, ...h.windows], {speed: 75});
  s.draw(h.heart, {speed: 30});
  s.draw(h.bubbles, {speed: 80});
}
const leave1 = Math.max(r1 + R(words('Evde iki dil: küçük ama etkili bir ipucu')) - EARLY, s.t + 4);
stops.push(stopAt('head', 540, 740, 0, leave1));

// ===== S2 · Child says "Ball!" =====
let arrive = leave1 + PAN;
s.in('colL').at(arrive - 8);
s.text('c1', 'Çocuğunuz Almanca', 120, 180, 100);
s.text('c2', 'bir kelime söyledi:', 120, 290, 100);
const kid = D.child(270, 482, 'kid');
s.draw([{d: bubblePath(705, 492, 205, 118, 2.62, [345, 505], 'bb1')}], {speed: 110, max: 12});
s.text('ball', 'Ball!', 705, 540, 140, {weight: 700, anchor: 'middle', cps: 0.75});
const r2 = s.t;
s.hl('c1', 'Almanca', r2, {dur: 9});
s.wait(6);
s.draw([...kid.head, ...kid.hair, ...kid.face], {speed: 60});
s.draw([...kid.body, ...kid.ball, ...kid.legs], {speed: 70});
const leave2 = Math.max(r2 + R(words('Çocuğunuz Almanca bir kelime söyledi: Ball!')) - EARLY, s.t + 4);
stops.push(stopAt('colL', 540, 522, arrive, leave2));

// ===== S3 · Don't correct =====
arrive = leave2 + PAN;
s.at(arrive - 8);
s.text('d1', 'Onu düzeltmeyin.', 120, 960, 130, {weight: 700, cps: 1.4});
const r3a = s.t;
s.hl('d1', 'düzeltmeyin.', r3a - 1, {dur: 10});
s.wait(1);
const p1 = D.parent(874, 1150, 'pa', 'stern');
s.draw([{d: bubblePath(430, 1155, 312, 110, 0.1, [792, 1176], 'bb2')}], {speed: 130, max: 12});
s.text('b1', 'Hayır, “top” denir!', 430, 1184, 84, {anchor: 'middle', maxW: 540});
const r3 = s.t;
s.wait(12);
s.draw(D.xMark(150, 1068, 708, 1244, 'x1'), {gap: 3});
s.draw([...p1.head, ...p1.hair, ...p1.face, ...p1.body], {speed: 70});
const leave3 = Math.max(r3 + R(words('Onu düzeltmeyin. Hayır, “top” denir!')) - EARLY, s.t + 4);
stops.push(stopAt('colL', 540, 1222, arrive, leave3));

// ===== S4 · Repeat it in a Turkish sentence =====
arrive = leave3 + PAN;
s.at(arrive - 8);
s.text('a1', 'Aynı kelimeyi Türkçe', 120, 1560, 100);
s.text('a2', 'bir cümlede tekrar edin:', 120, 1668, 100);
const p2 = D.parent(884, 1880, 'pb', 'warm');
s.draw([{d: bubblePath(432, 1885, 322, 138, 0.1, [806, 1905], 'bb3')}], {speed: 130, max: 12});
s.text('p1', 'Ball mu? Evet, top!', 432, 1866, 84, {weight: 700, anchor: 'middle', maxW: 590});
s.text('p2', 'Kırmızı top.', 432, 1962, 84, {weight: 700, anchor: 'middle', maxW: 590});
const r4 = s.t;
s.hl('a1', 'Türkçe', r4, {dur: 9});
s.wait(6);
s.draw(D.check(52, 1800, 1, 'ck'));
s.draw([...p2.head, ...p2.hair, ...p2.face, ...p2.body], {speed: 70});
s.draw([
  {d: ellipsePath(668, 2098, 48, 'rb')},
  {d: scribblePath(668, 2098, 48, 'rbs'), c: RED, w: 7, speed: 80},
  {d: wavy(600, 740, 2160, 3, 50, 'rbg'), w: 6, o: 0.6},
]);
const leave4 = Math.max(
  r4 + R(words('Aynı kelimeyi Türkçe bir cümlede tekrar edin: Ball mu? Evet, top! Kırmızı top.')) - EARLY,
  s.t + 4,
);
stops.push(stopAt('colL', 540, 1902, arrive, leave4));

// column divider drawn during the long move up to the right column
s.in('board').draw([{d: dividerPath(), w: 5, o: 0.3}], {at: leave4 + 4, pen: false, speed: 60, max: 30});
function dividerPath() {
  const pts: P[] = [];
  for (let i = 0; i <= 16; i++) pts.push([935 + Math.sin(i * 1.3) * 5, 2960 - i * 102]);
  return smoothPath(pts);
}

// ===== S5 · Communication keeps flowing =====
arrive = leave4 + PAN_LONG;
s.in('colR').at(arrive - 8);
s.text('r1', 'Böylece iletişim kesilmez,', 120, 190, 94, {maxW: 830});
s.text('r2', 'yeni kelime de doğal', 120, 296, 94);
s.text('r3', 'biçimde duyulur.', 120, 402, 94);
const r5 = s.t;
s.hl('r1', 'iletişim kesilmez', r5, {dur: 11});
s.wait(8);
s.draw(D.smallHead(270, 598, 62, 'sh1', 'child'), {speed: 65});
s.draw(D.smallHead(830, 585, 72, 'sh2', 'parent'), {speed: 65});
s.draw(D.loopArrows(552, 592, 86, 'lp'), {speed: 65});
s.draw(D.soundWaves(350, 590, 'sw'), {speed: 30});
s.draw(D.sparkle(552, 478, 1.0, 'sp1'), {speed: 20});
const leave5 = Math.max(r5 + R(words('Böylece iletişim kesilmez, yeni kelime de doğal biçimde duyulur.')) - EARLY, s.t + 4);
stops.push(stopAt('colR', 540, 490, arrive, leave5));

// ===== S6 · What else at home? =====
arrive = leave5 + PAN;
s.at(arrive - 8);
s.text('h1', 'Evde başka neler', 120, 862, 116, {weight: 700, cps: 1.5});
s.text('h2', 'yapabilirsiniz?', 120, 978, 116, {weight: 700, cps: 1.5});
s.draw([{d: wavy(128, 700, 1022, 8, 64, 'hu'), w: 7, c: C.orangeDeep}], {speed: 60});
const IT = {size: 76, maxW: 670};
// item 1
s.text('i1a', 'En rahat olduğunuz', 270, 1145, IT.size, {maxW: IT.maxW});
s.text('i1b', 'dilde konuşun.', 270, 1231, IT.size, {maxW: IT.maxW});
const r6a = s.t;
s.hl('i1a', 'rahat', r6a, {dur: 8});
s.draw(D.heartBubble(172, 1160, 1.0, 'i1'), {speed: 60});
// item 2
s.at(s.t + 1);
s.draw(D.bowl(172, 1362, 0.82, 'bw'), {speed: 60});
s.draw(D.tub(172, 1474, 0.82, 'tb'), {speed: 60});
s.draw(D.shirt(172, 1584, 0.76, 'sh'), {speed: 60});
s.at(Math.max(s.t + 2, r6a + Math.round(5 * 0.35 * FPS) + 4));
s.text('i2a', 'Yemek, banyo, giyinme', 270, 1360, IT.size, {maxW: IT.maxW});
s.text('i2b', 'gibi her gün tekrarlanan', 270, 1446, IT.size, {maxW: IT.maxW});
s.text('i2c', 'anlardan yararlanın.', 270, 1532, IT.size, {maxW: IT.maxW});
const r6b = s.t;
s.hl('i2b', 'her gün', r6b, {dur: 8});
// item 3
s.at(r6b + 6);
s.draw(D.book(172, 1722, 0.86, 'bk'), {speed: 60});
s.draw(D.note(172, 1846, 0.92, 'nt'), {speed: 30});
s.at(Math.max(s.t + 2, r6b + Math.round(9 * 0.35 * FPS) + 4));
s.text('i3a', 'Türkçe resimli kitap,', 270, 1714, IT.size, {maxW: IT.maxW});
s.text('i3b', 'tekerleme ve şarkılarla', 270, 1800, IT.size, {maxW: IT.maxW});
s.text('i3c', 'destekleyin.', 270, 1886, IT.size, {maxW: IT.maxW});
const r6 = s.t;
const leave6 = Math.max(r6 + R(words('Türkçe resimli kitap, tekerleme ve şarkılarla destekleyin.')) - EARLY, s.t + 4);
stops.push(stopAt('colR', 540, 1424, arrive, leave6));

// ===== S7 · Closing =====
arrive = leave6 + PAN;
// two arrows flowing from both columns into the conclusion (drawn during the move)
{
  const a1 = arrow([[430, 3040], [460, 3110], [560, 3150]], 'ca1', 28);
  const a2 = arrow([[1250, 2860], [1245, 2980], [1180, 3080], [1110, 3140]], 'ca2', 28);
  s.in('board').draw(
    [
      {d: a2[0], w: 8},
      {d: a2[1], w: 8},
      {d: a1[0], w: 8},
      {d: a1[1], w: 8},
    ],
    {at: leave6 - 2, speed: 30, gap: 1},
  );
}
s.in('close').at(arrive - 2);
s.text('k1', 'Önemli olan', 510, 790, 150, {weight: 700, anchor: 'middle', cps: 1.3});
s.text('k2', 'tutarlılık ve', 510, 950, 150, {weight: 700, anchor: 'middle', cps: 1.3});
s.text('k3', 'bol etkileşim.', 510, 1110, 150, {weight: 700, anchor: 'middle', cps: 1.3});
const r7 = s.t;
s.hl('k2', 'tutarlılık', r7, {dur: 10});
s.hl('k3', 'bol etkileşim', r7 + 8, {dur: 12, style: 'underline', c: INK});
s.wait(10);
s.draw([{d: frame(510, 905, 478, 292, 'kf', 0.32), w: 8}], {speed: 70, max: 30});
s.draw(D.sparkle(92, 640, 1.1, 'ks1'), {speed: 20});
s.draw(D.sparkle(930, 640, 1.1, 'ks2'), {speed: 20});
const readEnd7 = r7 + R(words('Önemli olan tutarlılık ve bol etkileşim.'));
stops.push(stopAt('close', 540, 995, arrive, readEnd7 - 40));

// ===== Summary: zoom out to the whole board, frame it =====
const SUM_Z = 0.37;
const zoomStart = readEnd7 - 40;
arrive = zoomStart + 40;
s.in('board').draw([{d: frame(895, 1978, 860, 1885, 'bf', 0.12), w: 11}], {at: zoomStart + 12, pen: false, speed: 260, max: 40});
const leaveSum = arrive + 26;
stops.push({x: 895 + 30 / SUM_Z, y: 1978 + 90 / SUM_Z, z: SUM_Z, arrive, leave: leaveSum});

// ===== Outro =====
arrive = leaveSum + 26;
s.in('out');
s.items.push({kind: 'logo', x: 510, y: 770, w: 700, space: 'out', start: arrive - 14, dur: 20, pen: true});
s.at(arrive + 7);
s.draw([{d: wavy(250, 770, 965, 8, 70, 'ou'), w: 8, c: C.orange}], {speed: 90});
s.text('o1', 'Yazının tamamı blogumuzda.', 510, 1090, 92, {anchor: 'middle', cps: 1.7, maxW: 840});
const rO = s.t;
s.hl('o1', 'blogumuzda', rO, {dur: 10});
const END = rO + R(3) + 4;
stops.push(stopAt('out', 540, 990, arrive, END + 10));

export const ITEMS: Item[] = s.items;
export const STOPS: Stop[] = stops;
export const TOTAL = END;
export const COVER = Math.round(leave1 - 6);

// ---------- local path helpers (kept here to avoid circular imports) ----------
import {bubble as bubbleRaw, ellipse as ellipseRaw, scribbleCircle, smooth as smoothRaw} from './rough';
function bubblePath(cx: number, cy: number, a: number, b: number, t: number, tip: P, seed: string) {
  return bubbleRaw(cx, cy, a, b, t, tip, seed);
}
function ellipsePath(cx: number, cy: number, r: number, seed: string) {
  return ellipseRaw(cx, cy, r, r, seed);
}
function scribblePath(cx: number, cy: number, r: number, seed: string) {
  return scribbleCircle(cx, cy, r, seed);
}
function smoothPath(pts: P[]) {
  return smoothRaw(pts);
}

// ---------- camera ----------
const ease = Easing.bezier(0.65, 0, 0.35, 1);
export type Cam = {x: number; y: number; z: number};
export const cameraAt = (f: number): Cam => {
  const DRIFT = 0.014;
  for (let i = 0; i < STOPS.length; i++) {
    const st = STOPS[i];
    if (f <= st.leave || i === STOPS.length - 1) {
      if (i > 0 && f < st.arrive) {
        const a = STOPS[i - 1];
        const t = interpolate(f, [a.leave, st.arrive], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const e = ease(t);
        const z0 = a.z * (1 + DRIFT);
        const dist = Math.hypot(st.x - a.x, st.y - a.y);
        const dip = Math.min(0.16, dist / 9000) * Math.sin(Math.PI * t);
        return {
          x: a.x + (st.x - a.x) * e,
          y: a.y + (st.y - a.y) * e,
          z: Math.exp(Math.log(z0) + (Math.log(st.z) - Math.log(z0)) * e) * (1 - dip),
        };
      }
      const h = interpolate(f, [st.arrive, st.leave], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
      return {x: st.x, y: st.y, z: st.z * (1 + DRIFT * h)};
    }
  }
  const l = STOPS[STOPS.length - 1];
  return {x: l.x, y: l.y, z: l.z};
};
