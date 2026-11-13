// v06 — "Evde sadece Almanca mı konuşalım?" · Messaging conversation
// All layout + timing constants live here. Everything is derived deterministically
// from the message list, so changing a line break or reading time re-flows the whole video.
import {random, spring, SpringConfig} from 'remotion';

export const FPS = 30;
export const W = 1080;
export const H = 1920;

// ---------- colours (Hasat palette + two quiet supporting tints) ----------
export const K = {
  chatTop: '#EAF0EC',
  chatBottom: '#DDE7E1',
  bubbleVeli: '#FFFFFF',
  tick: '#9DB0A9',
} as const;

// ---------- layout (px, full-res frame coordinates) ----------
export const LAYOUT = {
  bezel: 14, // device edge visible around the screen
  screenR: 68,
  colL: 80, // chat column (inside the safe zone)
  colR: 940,
  headerBottom: 372,
  inputBottom: 1494,
  inputBaseH: 112,
  inputGap: 22,
  sendSize: 104,
  bubbleMaxW: 800,
} as const;
export const COL_CX = (LAYOUT.colL + LAYOUT.colR) / 2;
export const VIEW_TOP = LAYOUT.headerBottom;
export const VIEW_BOTTOM = LAYOUT.inputBottom - LAYOUT.inputBaseH - LAYOUT.inputGap;
export const VIEW_H = VIEW_BOTTOM - VIEW_TOP;

/** Chat bubble metrics */
export const BUB = {font: 50, lh: 66, padT: 22, padB: 14, padX: 36, metaH: 36, radius: 44, tail: 12} as const;
/** Final (statement) bubble: same text block rendered at CARD size and scaled down in the bubble */
export const FIN = {bubbleFont: 60, cardFont: 136, lhRatio: 1.06} as const;
export const FIN_SCALE0 = FIN.bubbleFont / FIN.cardFont;
/** Input bar text */
export const INP = {font: 44, lh: 58, padT: 27, padX: 40} as const;
/** Typing indicator bubble */
export const IND = {w: 176, h: 100} as const;
/** "Ailelerden sık gelen bir soru" chip */
export const CHIP = {y: 30, h: 92} as const;
export const CB_PAD = 22; // breathing room under the newest item

// ---------- timing ----------
export const T = {
  chipAt: 2,
  firstType: 34,
  cps: 2.5, // typed characters per frame (stylised)
  minType: 16,
  sendPause: 9,
  indDur: 38, // typing indicator visible before a Hasat message
  indLead: 24, // indicator starts this many frames before the previous message's reading time is over
  typeLead: 4,
  veliCredit: 0.6, // part of the typing time that counts as reading time
  hlDelay: 16,
  hlDur: 18,
  finalHold: 44, // final bubble sits in the chat before expanding
  expandDur: 34,
  cardHold: 80,
  outroDur: 120,
} as const;

export const SPR = {
  scroll: {damping: 200, stiffness: 70, mass: 1} as Partial<SpringConfig>,
  pop: {damping: 15, stiffness: 170, mass: 0.9} as Partial<SpringConfig>,
  soft: {damping: 200, stiffness: 120} as Partial<SpringConfig>,
  line: {damping: 20, stiffness: 220, mass: 0.7} as Partial<SpringConfig>,
};

export const sp = (f: number, config: Partial<SpringConfig> = {damping: 200}) =>
  f <= 0 ? 0 : spring({frame: f, fps: FPS, config});

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));

// ---------- messages (exact Turkish from SCRIPT.md; *x* = highlighted key phrase) ----------
export type Who = 'veli' | 'hasat';
export type MsgDef = {
  who: Who;
  time: string;
  lines: string[]; // bubble line breaks
  input?: string[]; // input-bar line breaks while typing (parent only)
  final?: boolean;
};

export const LABEL = 'Ailelerden sık gelen bir soru';

export const MSGS: MsgDef[] = [
  {
    who: 'veli',
    time: '21:04',
    lines: ['Merhaba, çocuğumun', 'öğretmeni kafası karışmasın', 'diye evde sadece Almanca', 'konuşmamızı önerdi.', 'Ne yapalım?'],
    input: ['Merhaba, çocuğumun öğretmeni', 'kafası karışmasın diye evde', 'sadece Almanca konuşmamızı', 'önerdi. Ne yapalım?'],
  },
  {
    who: 'hasat',
    time: '21:06',
    lines: ['Bu öneriyi çok sık', 'duyuyoruz. Kararınızı', 'vermeden önce bilmeniz', 'gereken birkaç şey var.'],
  },
  {who: 'hasat', time: '21:06', lines: ['İki dil, dil gelişimini', '*geciktirmez.*']},
  {
    who: 'veli',
    time: '21:07',
    lines: ['Ama çocuğum otizmli.', 'Onun için de geçerli mi?'],
    input: ['Ama çocuğum otizmli. Onun', 'için de geçerli mi?'],
  },
  {
    who: 'hasat',
    time: '21:08',
    lines: ['Evet.', 'Araştırmalar, iki dille', 'büyüyen otizmli çocukların', 'dil becerilerinde', '*bir gerilik bulmadı.*'],
  },
  {
    who: 'hasat',
    time: '21:08',
    lines: ['Üstelik anne babalar', 'çocuklarıyla en sıcak ve', 'en zengin biçimde', '*kendi dillerinde* konuşur.'],
  },
  {
    who: 'hasat',
    time: '21:09',
    lines: ['Evin dilini bırakmak;', 'büyükanne, büyükbaba ve', 'akrabalarla kurulan', '*bağı da zayıflatabilir.*'],
  },
  {who: 'veli', time: '21:10', lines: ['Peki Almanca ne olacak?'], input: ['Peki Almanca ne olacak?']},
  {
    who: 'hasat',
    time: '21:11',
    lines: ['Almanca kreşte, okulda ve', 'arkadaşlarla gelişir.', 'Bunun için evin dilinden', '*vazgeçmeniz gerekmez.*'],
  },
  {
    who: 'hasat',
    time: '21:12',
    lines: ['Bir de: *Uzmanlara iki*', '*dilli olduğunuzu söyleyin.*', 'Çocuğunuzun iki dildeki', 'becerileri birlikte', 'değerlendirilmeli.'],
  },
  {who: 'hasat', time: '21:12', lines: ['Evde Türkçe', 'konuşmaya', '*devam edin.*'], final: true},
];

// ---------- derived ----------
const plain = (s: string) => s.replace(/\*/g, '');
export const countWords = (lines: string[]) => plain(lines.join(' ')).split(/\s+/).filter(Boolean).length;
export const readFrames = (words: number) => Math.ceil((0.35 * words + 1.2) * FPS);

export const finLh = FIN.bubbleFont * FIN.lhRatio;
export const bubbleH = (m: MsgDef) =>
  m.final
    ? BUB.padT + 6 + m.lines.length * finLh + BUB.metaH + BUB.padB
    : BUB.padT + m.lines.length * BUB.lh + BUB.metaH + BUB.padB;

export type Timed = MsgDef & {
  i: number;
  words: number;
  read: number;
  y: number; // content y (top)
  h: number;
  gap: number;
  pop: number; // bubble appears
  indStart?: number;
  typeStart?: number;
  typeEnd?: number;
  charTimes?: number[]; // frame at which each char of input.join(' ') appears
  lineStarts?: number[]; // frame at which each input line gets its first char
  lineOffsets?: number[];
  seenAt?: number; // read ticks turn orange
};

const build = () => {
  const out: Timed[] = [];
  let y = CHIP.y + CHIP.h;
  let cursor: number = T.firstType;
  MSGS.forEach((m, i) => {
    const prev = MSGS[i - 1];
    const gap = i === 0 ? 40 : prev.who === m.who ? 14 : 34;
    const h = bubbleH(m);
    const words = countWords(m.lines);
    const read = readFrames(words);
    const t: Timed = {...m, i, words, read, y: y + gap, h, gap, pop: 0};
    y = t.y + h;
    if (m.who === 'veli') {
      const text = (m.input ?? m.lines).join(' ');
      const n = text.length;
      const dur = Math.max(T.minType, Math.ceil(n / T.cps));
      // organic typing rhythm: per-character weights (deterministic)
      const wts = Array.from(text).map((ch, k) => {
        const base = 0.65 + 0.7 * random(`v06-type-${i}-${k}`);
        const prevCh = text[k - 1];
        return base * (ch === ' ' ? 1.35 : 1) * (prevCh === '.' || prevCh === ',' || prevCh === '?' ? 2.2 : 1);
      });
      const total = wts.reduce((a, b) => a + b, 0);
      let acc = 0;
      t.charTimes = wts.map((w) => {
        acc += w;
        return cursor + (acc / total) * dur;
      });
      const lines = m.input ?? m.lines;
      let off = 0;
      t.lineOffsets = lines.map((l) => {
        const o = off;
        off += l.length + 1;
        return o;
      });
      t.lineStarts = t.lineOffsets.map((o) => t.charTimes![o]);
      t.typeStart = cursor;
      t.typeEnd = cursor + dur;
      t.pop = t.typeEnd + T.sendPause;
    } else {
      t.indStart = cursor;
      t.pop = cursor + T.indDur;
    }
    const next = MSGS[i + 1];
    if (next) {
      const credit = m.who === 'veli' ? Math.round(T.veliCredit * (t.typeEnd! - t.typeStart!)) : 0;
      cursor = t.pop + read - credit - (next.who === 'hasat' ? T.indLead : T.typeLead);
    }
    out.push(t);
  });
  // read receipts: a parent message is "seen" when Hasat starts typing the reply
  out.forEach((t, i) => {
    if (t.who === 'veli') {
      const reply = out.slice(i + 1).find((x) => x.who === 'hasat');
      t.seenAt = reply?.indStart;
    }
  });
  return out;
};

export const TL = build();
export const LAST = TL[TL.length - 1];
export const EXPAND_AT = LAST.pop + T.finalHold;
export const CARD_AT = EXPAND_AT + T.expandDur;
export const OUTRO_AT = CARD_AT + T.cardHold;
export const TOTAL = OUTRO_AT + T.outroDur;

// content-bottom events for the auto-scroll
type CbEv = {t: number; d: number};
export const CB_EVENTS: CbEv[] = (() => {
  const ev: CbEv[] = [{t: T.chipAt, d: CHIP.y + CHIP.h}];
  TL.forEach((m) => {
    if (m.who === 'veli') ev.push({t: m.pop, d: m.gap + m.h});
    else {
      ev.push({t: m.indStart!, d: m.gap + IND.h});
      ev.push({t: m.pop, d: m.h - IND.h});
    }
  });
  return ev;
})();

/** Extra height of the input bar (multi-line typing), animated. */
export const inputExtra = (f: number) => {
  let e = 0;
  TL.forEach((m) => {
    if (m.who !== 'veli' || !m.lineStarts) return;
    m.lineStarts.forEach((ls, k) => {
      if (k > 0) e += INP.lh * sp(f - ls, SPR.line);
    });
    e -= (m.lineStarts.length - 1) * INP.lh * sp(f - m.pop, SPR.soft);
  });
  return e;
};

/** Current scroll offset of the chat list (px). */
export const scrollAt = (f: number) => {
  let cb = 0;
  CB_EVENTS.forEach((e) => {
    cb += e.d * sp(f - e.t, SPR.scroll);
  });
  return Math.max(0, cb + CB_PAD - (VIEW_H - inputExtra(f)));
};

/** Screen-space top of an item at content y. */
export const screenY = (contentY: number, f: number) => VIEW_TOP + contentY - scrollAt(f);

export const isTyping = (f: number) => TL.some((m) => m.indStart !== undefined && f >= m.indStart && f < m.pop);
