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
  close: {ox: 353, oy: 2335, s: 1 / 0.9},
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
      const dur = Math.max(3, Math.min(o.max ?? 24, Math.round(len / (s.speed ?? o.speed ?? 34))));
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
      t += dur + (o.gap ?? 2);
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

const EARLY = 6; // the move may start this many frames before the reading time is fully over
const PAN = 24;
const PAN_LONG = 40;

const s = new Script();
const stops: Stop[] = [];

// ===== S1 · Title + house =====
s.in('head').at(-5);
s.text('t1', 'Evde iki dil:', 510, 760, 168, {weight: 700, anchor: 'middle', cps: 0.95});
s.text('t2', 'küçük ama etkili', 510, 908, 116, {weight: 700, anchor: 'middle', cps: 1.15});
s.text('t3', 'bir ipucu', 510, 1030, 116, {weight: 700, anchor: 'middle', cps: 1.15});
const r1 = s.t;
s.hl('t2', 'etkili', r1, {dur: 9});
s.wait(6);
{
  const h = D.house(510, 560);
  s.draw([...h.roof, ...h.walls, ...h.chimney, ...h.door, ...h.windows], {speed: 40});
  s.draw(h.heart, {speed: 20});
  s.draw(h.bubbles, {speed: 34});
}
const leave1 = Math.max(r1 + R(words('Evde iki dil: küçük ama etkili bir ipucu')) - EARLY, s.t + 4);
stops.push(stopAt('head', 540, 735, 0, leave1));

// ===== S2 · Child says "Ball!" =====
let arrive = leave1 + PAN;
s.in('colL').at(arrive - 8);
s.text('c1', 'Çocuğunuz Almanca', 130, 170, 80);
s.text('c2', 'bir kelime söyledi:', 130, 255, 80);
const kid = D.child(290, 430, 'kid');
s.draw(kid.head, {speed: 45});
s.draw([{d: bubbleBall()}], {speed: 50});
s.text('ball', 'Ball!', 690, 474, 128, {weight: 700, anchor: 'middle', cps: 0.75});
const r2 = s.t;
s.hl('c1', 'Almanca', r2, {dur: 9});
s.wait(8);
s.draw([...kid.hair, ...kid.face], {speed: 30});
s.draw([...kid.body, ...kid.ball, ...kid.legs], {speed: 40});
const leave2 = Math.max(r2 + R(words('Çocuğunuz Almanca bir kelime söyledi: Ball!')) - EARLY, s.t + 4);
stops.push(stopAt('colL', 540, 500, arrive, leave2));

function bubbleBall() {
  return bubblePath(690, 432, 190, 108, 2.62, [368, 452], 'bb1');
}

// ===== S3 · Don't correct =====
arrive = leave2 + PAN;
s.at(arrive - 8);
s.text('d1', 'Onu düzeltmeyin.', 130, 905, 112, {weight: 700, cps: 1.4});
const r3a = s.t;
s.hl('d1', 'düzeltmeyin.', r3a - 1, {dur: 10});
s.wait(4);
const p1 = D.parent(862, 1090, 'pa', 'stern');
s.draw(p1.head, {speed: 45});
s.draw([{d: bubblePath(420, 1098, 300, 100, 0.1, [778, 1120], 'bb2')}], {speed: 60});
s.text('b1', 'Hayır, “top” denir!', 420, 1122, 72, {anchor: 'middle', maxW: 520});
const r3 = s.t;
s.wait(16);
s.draw(D.xMark(150, 1018, 690, 1182, 'x1'), {gap: 3});
s.draw([...p1.hair, ...p1.face, ...p1.body], {speed: 40});
const leave3 = Math.max(r3 + R(words('Onu düzeltmeyin. Hayır, “top” denir!')) - EARLY, s.t + 4);
stops.push(stopAt('colL', 540, 1165, arrive, leave3));

// ===== S4 · Repeat it in a Turkish sentence =====
arrive = leave3 + PAN;
s.at(arrive - 8);
s.text('a1', 'Aynı kelimeyi Türkçe', 130, 1480, 80);
s.text('a2', 'bir cümlede tekrar edin:', 130, 1565, 80);
const p2 = D.parent(862, 1770, 'pb', 'warm');
s.draw(p2.head, {speed: 45});
s.draw([{d: bubblePath(420, 1780, 300, 128, 0.1, [778, 1800], 'bb3')}], {speed: 60});
s.text('p1', 'Ball mu? Evet, top!', 420, 1765, 76, {weight: 700, anchor: 'middle', maxW: 540});
s.text('p2', 'Kırmızı top.', 420, 1852, 76, {weight: 700, anchor: 'middle', maxW: 540});
const r4 = s.t;
s.hl('a1', 'Türkçe', r4, {dur: 9});
s.wait(6);
s.draw(D.check(70, 1690, 1, 'ck'));
s.draw([...p2.hair, ...p2.face, ...p2.body], {speed: 40});
s.draw([
  {d: ellipsePath(655, 1995, 42, 'rb')},
  {d: scribblePath(655, 1995, 42, 'rbs'), c: RED, w: 7, speed: 80},
]);
const leave4 = Math.max(
  r4 + R(words('Aynı kelimeyi Türkçe bir cümlede tekrar edin: Ball mu? Evet, top! Kırmızı top.')) - EARLY,
  s.t + 4,
);
stops.push(stopAt('colL', 540, 1805, arrive, leave4));

// column divider drawn during the long move up to the right column
s.in('board').draw([{d: dividerPath(), w: 5, o: 0.3}], {
  at: leave4 + 4,
  pen: false,
  speed: 60,
  max: 30,
});
function dividerPath() {
  const pts: P[] = [];
  for (let i = 0; i <= 16; i++) pts.push([918 + Math.sin(i * 1.3) * 5, 2880 - i * 100]);
  return smoothPath(pts);
}

// ===== S5 · Communication keeps flowing =====
arrive = leave4 + PAN_LONG;
s.in('colR').at(arrive - 8);
s.text('r1', 'Böylece iletişim kesilmez,', 130, 175, 78, {maxW: 820});
s.text('r2', 'yeni kelime de doğal', 130, 263, 78);
s.text('r3', 'biçimde duyulur.', 130, 351, 78);
const r5 = s.t;
s.hl('r1', 'iletişim kesilmez', r5, {dur: 11});
s.wait(8);
s.draw(D.smallHead(290, 520, 50, 'sh1', 'child'), {speed: 40});
s.draw(D.smallHead(820, 510, 60, 'sh2', 'parent'), {speed: 40});
s.draw(D.loopArrows(555, 515, 72, 'lp'), {speed: 40});
s.draw(D.soundWaves(352, 512, 'sw'), {speed: 30});
s.draw(D.sparkle(555, 432, 0.9, 'sp1'), {speed: 20});
const leave5 = Math.max(r5 + R(words('Böylece iletişim kesilmez, yeni kelime de doğal biçimde duyulur.')) - EARLY, s.t + 4);
stops.push(stopAt('colR', 540, 440, arrive, leave5));

// ===== S6 · What else at home? =====
arrive = leave5 + PAN;
s.at(arrive - 8);
s.text('h1', 'Evde başka neler', 130, 800, 100, {weight: 700, cps: 1.5});
s.text('h2', 'yapabilirsiniz?', 130, 900, 100, {weight: 700, cps: 1.5});
s.draw([{d: wavy(138, 640, 942, 7, 60, 'hu'), w: 7, c: C.orangeDeep}], {speed: 60});
// item 1
s.draw(D.heartBubble(190, 1070, 0.95, 'i1'), {speed: 40});
s.text('i1a', 'En rahat olduğunuz', 290, 1060, 68, {maxW: 650});
s.text('i1b', 'dilde konuşun.', 290, 1138, 68, {maxW: 650});
const r6a = s.t;
s.hl('i1a', 'rahat', r6a, {dur: 8});
// item 2
s.at(Math.max(s.t, r6a + 20));
s.draw(D.bowl(190, 1262, 0.78, 'bw'), {speed: 40});
s.draw(D.tub(190, 1372, 0.78, 'tb'), {speed: 40});
s.draw(D.shirt(190, 1478, 0.72, 'sh'), {speed: 40});
s.at(Math.max(s.t, r6a + R(5) - 26));
s.text('i2a', 'Yemek, banyo, giyinme', 290, 1270, 68, {maxW: 650});
s.text('i2b', 'gibi her gün tekrarlanan', 290, 1348, 68, {maxW: 650});
s.text('i2c', 'anlardan yararlanın.', 290, 1426, 68, {maxW: 650});
const r6b = s.t;
s.hl('i2b', 'her gün', r6b, {dur: 8});
// item 3
s.at(Math.max(s.t, r6b + 34));
s.draw(D.book(190, 1622, 0.82, 'bk'), {speed: 40});
s.draw(D.note(190, 1730, 0.85, 'nt'), {speed: 30});
s.at(Math.max(s.t, r6b + R(9) - 26));
s.text('i3a', 'Türkçe resimli kitap,', 290, 1612, 68, {maxW: 650});
s.text('i3b', 'tekerleme ve şarkılarla', 290, 1690, 68, {maxW: 650});
s.text('i3c', 'destekleyin.', 290, 1768, 68, {maxW: 650});
const r6 = s.t;
const leave6 = Math.max(r6 + R(words('Türkçe resimli kitap, tekerleme ve şarkılarla destekleyin.')) - EARLY, s.t + 4);
stops.push(stopAt('colR', 540, 1325, arrive, leave6));

// ===== S7 · Closing =====
arrive = leave6 + PAN;
// two arrows flowing from both columns into the conclusion (drawn during the move)
{
  const a1 = arrow([[470, 2960], [520, 3030], [610, 3075]], 'ca1', 26);
  const a2 = arrow([[1330, 2760], [1300, 2900], [1210, 3010], [1150, 3050]], 'ca2', 26);
  s.in('board').draw(
    [
      {d: a2[0], w: 7},
      {d: a2[1], w: 7},
      {d: a1[0], w: 7},
      {d: a1[1], w: 7},
    ],
    {at: leave6 - 2, speed: 30, gap: 1},
  );
}
s.in('close').at(arrive - 2);
s.text('k1', 'Önemli olan', 510, 760, 120, {weight: 700, anchor: 'middle', cps: 1.3});
s.text('k2', 'tutarlılık ve', 510, 890, 120, {weight: 700, anchor: 'middle', cps: 1.3});
s.text('k3', 'bol etkileşim.', 510, 1020, 120, {weight: 700, anchor: 'middle', cps: 1.3});
const r7 = s.t;
s.hl('k2', 'tutarlılık', r7, {dur: 10});
s.hl('k3', 'bol etkileşim', r7 + 8, {dur: 12, style: 'underline', c: INK});
s.wait(16);
s.draw([{d: frame(510, 870, 455, 250, 'kf', 0.32), w: 8}], {speed: 70, max: 30});
s.draw(D.sparkle(118, 640, 1.1, 'ks1'), {speed: 20});
s.draw(D.sparkle(902, 640, 1.1, 'ks2'), {speed: 20});
const readEnd7 = r7 + R(words('Önemli olan tutarlılık ve bol etkileşim.'));
stops.push(stopAt('close', 540, 950, arrive, readEnd7 - 40));

// ===== Summary: zoom out to the whole board, frame it =====
const SUM_Z = 0.42;
const zoomStart = readEnd7 - 40;
arrive = zoomStart + 46;
s.in('board').draw([{d: frame(920, 1860, 880, 1790, 'bf', 0.12), w: 10}], {at: zoomStart + 14, pen: false, speed: 260, max: 40});
const leaveSum = arrive + 38;
stops.push({x: 920 + 30 / SUM_Z, y: 1860 + 90 / SUM_Z, z: SUM_Z, arrive, leave: leaveSum});

// ===== Outro =====
arrive = leaveSum + 30;
s.in('out');
s.items.push({kind: 'logo', x: 510, y: 760, w: 620, space: 'out', start: arrive - 12, dur: 24, pen: true});
s.at(arrive + 14);
s.text('o1', 'Yazının tamamı blogumuzda.', 510, 1030, 80, {anchor: 'middle', cps: 1.7, maxW: 820});
const rO = s.t;
s.hl('o1', 'blogumuzda', rO, {dur: 10});
const END = rO + R(3) + 4;
stops.push(stopAt('out', 540, 950, arrive, END + 10));

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
