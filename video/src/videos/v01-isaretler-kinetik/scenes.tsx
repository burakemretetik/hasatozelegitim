import React from 'react';
import {Img, staticFile} from 'remotion';
import {Basak, C} from '../../shared/brand';
import type {StyleId} from './metrics';
import {EASE, T, countWords, ramp, readFrames} from './timing';
import {Line, LineIn, Lines, MarkerSpec, Numeral, PAL, Pal, Progress, W, X0, X1, met, schedule, setExit, stack} from './kit';

export type ScenePlan = {
  key: string;
  exitAt: number; // local frame where the content starts leaving (end of the guaranteed reading hold)
  dir: 'up' | 'left' | 'none';
  accent: string;
  pal: Pal;
  Comp: React.FC<{f: number}>;
};

const shift = (ls: Line[], dy: number) =>
  ls.forEach((l) => {
    l.top += dy;
    l.bottom += dy;
    l.baseline += dy;
  });

/* =============================================================== 1 HOOK */
const hook = (): ScenePlan => {
  const p = PAL.cream;
  const lines = stack(
    [
      {text: 'Otizmin ilk', style: 'D', color: p.main},
      {text: 'işaretleri', style: 'D', color: p.main},
      {text: 'çoğu zaman', style: 'L', color: p.soft},
      {text: 'konuşmadan', style: 'D', color: p.main, gap: 46},
      {text: 'önce', style: 'D', color: p.main},
      {text: 'görülür.', style: 'D', color: p.main, gap: 48},
    ],
    {width: 780, center: 866, gap: 20},
  );
  const last = schedule(lines, -6, 3, 3);
  const exitAt = last + T.LEGIBLE + readFrames(7);
  setExit(lines, exitAt);
  const markers: MarkerSpec[] = [{lines: [3, 4], start: 14, exit: exitAt + 1, color: C.orange, padY: 0.075}];
  const Comp: React.FC<{f: number}> = ({f}) => <Lines lines={lines} f={f} markers={markers} />;
  return {key: 'hook', exitAt, dir: 'none', accent: C.orange, pal: p, Comp};
};

/* ============================================================== 2 INTRO */
const intro = (): ScenePlan => {
  const p = PAL.green;
  const lines = stack(
    [
      {text: 'Sosyal', style: 'D', color: p.main, size: 150},
      {text: 'iletişimde', style: 'D', color: p.main, size: 150},
      {text: 'dikkat', style: 'L', color: p.soft, size: 104, gap: 28},
      {text: 'edebileceğiniz', style: 'L', color: p.soft, size: 104},
    ],
    {top: 0, gap: 14},
  );
  const NS = 700;
  const m5 = met('N', '5');
  const numBase = lines[3].bottom + 70 + (m5.a * NS) / 100;
  const word = stack([{text: 'işaret', style: 'D', color: p.main, size: 140}], {x: X0 + ((m5.l + m5.r) * NS) / 100 + 40, top: 0})[0];
  shift([word], numBase - word.baseline);
  const blockH = numBase + 4 - lines[0].top;
  const dy = 868 - blockH / 2 - lines[0].top;
  shift(lines, dy);
  shift([word], dy);
  const base5 = numBase + dy;

  const last = schedule(lines, T.BUILD);
  const s5 = last + 4;
  schedule([word], s5 + 6);
  const legible = s5 + 6 + T.LEGIBLE;
  const exitAt = legible + readFrames(6);
  setExit(lines, exitAt);
  word.exit = exitAt + 3;
  const all = [...lines, word];
  const Comp: React.FC<{f: number}> = ({f}) => (
    <>
      <Numeral n="5" x={X0} baseline={base5} size={NS} f={f} start={s5} fillStart={0} exit={exitAt + 2} stroke={p.main} bg={p.bg} fill={C.orange} outline={false} />
      <Lines lines={all} f={f} />
      <Progress x={word.x + 4} y={word.top - 44} current={0} f={f} start={s5 + 12} exit={exitAt + 3} pal={p} w={50} />
    </>
  );
  return {key: 'intro', exitAt, dir: 'up', accent: C.orange, pal: p, Comp};
};

/* ============================================================== 3 ITEMS */
type ItemLine = [string, StyleId, boolean?];
const item = (n: number, palKey: 'cream' | 'green', texts: ItemLine[], S: number, note?: string[]): ScenePlan => {
  const p = PAL[palKey];
  const NS = 540;
  const nm = met('N', String(n));
  let numBase = 252 + (nm.a * NS) / 100;
  let ruleY = numBase + 40;
  const RULE_H = 8;
  const ins: LineIn[] = texts.map(([text, style, marker]) => ({
    text,
    style,
    color: style === 'L' ? p.soft : p.main,
    size: S,
    marker,
    swap: p.swap,
  }));
  const lines = stack(ins, {top: ruleY + RULE_H + 54, step: S * 1.03});
  const mIdx = texts.findIndex((t) => t[2]);
  if (mIdx > 0) shift(lines.slice(mIdx), S * 0.13); // breathing room above the marker block
  const tStart = T.BUILD + 4;
  const last = schedule(lines, tStart);
  const legible = last + T.LEGIBLE;
  const mainWords = countWords(texts.map((t) => t[0]));

  let noteLines: Line[] = [];
  let noteStart = 0;
  let exitAt = legible + readFrames(mainWords);
  if (note) {
    noteLines = stack(
      note.map((t) => ({text: t, style: 'I' as StyleId, color: p.soft, size: 48})),
      {x: X0 + 36, top: lines[lines.length - 1].bottom + 66, step: 64},
    );
    noteStart = legible + T.NOTE_DELAY;
    const nl = schedule(noteLines, noteStart, 2, 3);
    const noteWords = countWords(note);
    exitAt = Math.max(legible + readFrames(mainWords + noteWords), nl + T.LEGIBLE + readFrames(noteWords));
  }
  // centre the whole card (numeral → note) in the safe zone
  const blockTop = numBase - (nm.a * NS) / 100;
  const blockBottom = (noteLines.length ? noteLines[noteLines.length - 1] : lines[lines.length - 1]).bottom;
  const dyC = Math.max(250 - blockTop, 862 - (blockTop + blockBottom) / 2);
  numBase += dyC;
  ruleY += dyC;
  shift(lines, dyC);
  shift(noteLines, dyC);
  setExit(lines, exitAt + 1);
  setExit(noteLines, exitAt + 1 + lines.length * T.EXIT_LINE);
  const mi = texts.findIndex((t) => t[2]);
  const markers: MarkerSpec[] =
    mi >= 0 ? [{lines: [mi], start: lines[mi].starts[lines[mi].starts.length - 1] + 3, exit: lines[mi].exit + 1, color: C.orange}] : [];

  const Comp: React.FC<{f: number}> = ({f}) => {
    const ra = ramp(f, T.BUILD + 3, 20, EASE.out);
    const re = ramp(f, exitAt + 1, T.EXIT, EASE.in);
    const nbA = ramp(f, noteStart - 3, 14, EASE.out);
    const nbE = ramp(f, exitAt + 1 + lines.length * T.EXIT_LINE, T.EXIT, EASE.in);
    return (
      <>
        <Numeral
          n={String(n)}
          x={X0}
          baseline={numBase}
          size={NS}
          f={f}
          start={T.BUILD}
          fillStart={T.BUILD + 16}
          exit={exitAt}
          stroke={p.main}
          bg={p.bg}
          fill={C.orange}
        />
        <Progress x={X1} y={numBase} alignRight current={n} f={f} start={T.BUILD + 6} exit={exitAt + 1} pal={p} />
        <div
          style={{
            position: 'absolute',
            top: ruleY,
            height: RULE_H,
            left: X0 + re * W,
            width: Math.max(0, (ra - re) * W),
            background: p.main,
          }}
        />
        <Lines lines={lines} f={f} markers={markers} />
        {note ? (
          <>
            <div
              style={{
                position: 'absolute',
                left: X0,
                width: 7,
                top: noteLines[0].top - 10,
                height: Math.max(0, (nbA - nbE) * (noteLines[noteLines.length - 1].bottom - noteLines[0].top + 20)),
                transform: `translateY(${(nbE * (noteLines[noteLines.length - 1].bottom - noteLines[0].top + 20)).toFixed(2)}px)`,
                background: C.orange,
              }}
            />
            <Lines lines={noteLines} f={f} />
          </>
        ) : null}
      </>
    );
  };
  return {key: 'item' + n, exitAt, dir: 'left', accent: C.orange, pal: p, Comp};
};

/* ================================================== 4 TEK BİR İŞARET */
const tek = (): ScenePlan => {
  const p = PAL.orange;
  const lines = stack(
    [
      {text: 'Tek bir işaret,', style: 'D', color: p.main},
      {text: 'tek başına', style: 'D', color: p.main},
      {text: 'otizm anlamına', style: 'L', color: p.main, gap: 26},
      {text: 'gelmez.', style: 'D', color: p.main, gap: 26},
    ],
    {center: 868, gap: 22},
  );
  const last = schedule(lines, T.BUILD, 2, 4);
  const exitAt = last + T.LEGIBLE + readFrames(8);
  setExit(lines, exitAt);
  const Comp: React.FC<{f: number}> = ({f}) => <Lines lines={lines} f={f} />;
  return {key: 'tek', exitAt, dir: 'up', accent: C.green, pal: p, Comp};
};

/* ============================================ 5 “BİR ŞEYLER FARKLI” */
const feel = (): ScenePlan => {
  const p = PAL.green;
  const lines = stack(
    [
      {text: 'Ama içinizdeki', style: 'L', color: p.soft},
      {text: '“bir şeyler', style: 'D', color: C.orange, gap: 26},
      {text: 'farklı”', style: 'D', color: C.orange},
      {text: 'duygusunu', style: 'L', color: p.soft, gap: 30},
      {text: 'ciddiye alın.', style: 'D', color: p.main, swap: C.green, gap: 30},
    ],
    {center: 868, gap: 18},
  );
  const CY = 868;
  const groups = [[0], [1, 2], [3, 4]];
  const g0 = T.BUILD;
  const g1 = g0 + 16;
  const g2 = g1 + 18;
  schedule([lines[0]], g0);
  schedule([lines[1], lines[2]], g1);
  const last = schedule([lines[3], lines[4]], g2);
  const exitAt = last + T.LEGIBLE + readFrames(8);
  setExit(lines, exitAt);
  const off = groups.map((g) => {
    const lastLine = lines[g[g.length - 1]];
    return CY - (lines[0].top + lastLine.bottom) / 2;
  });
  const markers: MarkerSpec[] = [{lines: [4], start: last + 3, exit: lines[4].exit + 1, color: C.orange}];
  const Comp: React.FC<{f: number}> = ({f}) => {
    const y = off[0] + (off[1] - off[0]) * ramp(f, g1 - 3, 16, EASE.inOut) + (off[2] - off[1]) * ramp(f, g2 - 3, 16, EASE.inOut);
    return (
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${y.toFixed(2)}px)`}}>
        <Lines lines={lines} f={f} markers={markers} />
      </div>
    );
  };
  return {key: 'feel', exitAt, dir: 'up', accent: C.cream, pal: p, Comp};
};

/* ======================================================= 6 GÖZLEMLER */
const gozlem = (): ScenePlan => {
  const p = PAL.cream;
  const lines = stack(
    [
      {text: 'Gözlemlerinizi', style: 'D', color: p.main},
      {text: 'not alın,', style: 'D', color: p.main, underline: true},
      {text: 'çocuğunuzun', style: 'L', color: p.soft, gap: 64},
      {text: 'doktoruyla', style: 'L', color: p.soft},
      {text: 'paylaşın.', style: 'D', color: p.main, underline: true},
    ],
    {center: 850, gap: 18},
  );
  const last = schedule(lines, T.BUILD, 2, 3);
  const exitAt = last + T.LEGIBLE + readFrames(6);
  setExit(lines, exitAt);
  const Comp: React.FC<{f: number}> = ({f}) => <Lines lines={lines} f={f} underline={{color: C.orange, delay: 5}} />;
  return {key: 'gozlem', exitAt, dir: 'up', accent: C.orange, pal: p, Comp};
};

/* ============================================================ 7 OUTRO */
const outro = (): ScenePlan => {
  const p = PAL.green;
  const LW = 780;
  const k = LW / 289.58;
  const lines0 = stack(
    [
      {text: 'Yazının tamamı', style: 'O', color: p.main, size: 104},
      {text: 'blogumuzda.', style: 'O', color: C.orange, size: 104},
    ],
    {top: 0, step: 118},
  );
  const textH = lines0[1].bottom - lines0[0].top;
  const logoInkTop = 24 * k;
  const logoInkBottom = 119 * k;
  const GAP = 96;
  const total = logoInkBottom - logoInkTop + GAP + textH;
  const visTop = 866 - total / 2;
  const imgTop = visTop - logoInkTop;
  const imgLeft = X0 - 25 * k;
  shift(lines0, imgTop + logoInkBottom + GAP - lines0[0].top);
  const lines = lines0;
  schedule(lines, 34, 3, 3);

  const parts = [
    {y0: 26, y1: 82, start: 22},
    {y0: 82, y1: 116, start: 27},
  ];
  const Comp: React.FC<{f: number}> = ({f}) => {
    const bp = ramp(f, 12, 34, EASE.soft);
    return (
      <>
        <div style={{position: 'absolute', left: imgLeft + -3.12 * k, top: imgTop + 22.8 * k}}>
          <Basak size={96 * k} progress={bp} stem={C.cream} grain={C.orange} />
        </div>
        {parts.map((pt, i) => {
          const r = ramp(f, pt.start, T.RISE + 4, EASE.out);
          const boxL = imgLeft + 92 * k;
          const boxT = imgTop + pt.y0 * k;
          const boxH = (pt.y1 - pt.y0) * k;
          return (
            <div key={i} style={{position: 'absolute', left: boxL, top: boxT, width: (289.58 - 92) * k, height: boxH, overflow: 'hidden'}}>
              <Img
                src={staticFile('brand/hasat-logo-yatay-koyu-zemin.svg')}
                style={{position: 'absolute', width: LW, height: 'auto', left: imgLeft - boxL, top: imgTop - boxT + (1 - r) * boxH * 1.1}}
              />
            </div>
          );
        })}
        <Lines lines={lines} f={f} />
      </>
    );
  };
  return {key: 'outro', exitAt: T.OUTRO, dir: 'up', accent: C.orange, pal: p, Comp};
};

/* ========================================================== sequence */
export const PLANS: ScenePlan[] = [
  hook(),
  intro(),
  item(1, 'cream', [['Göz teması', 'D'], ['az ya da', 'L'], ['çok kısa.', 'D', true]], 148),
  item(2, 'green', [['Adıyla', 'D'], ['seslenildiğinde', 'D'], ['çoğu zaman', 'L'], ['dönmüyor.', 'D', true]], 116, ['İşitme sorunu olmadığı halde.']),
  item(3, 'cream', [['Gülümsemenize', 'D'], ['karşılık', 'L'], ['vermiyor.', 'D', true]], 108, ['Ce-e gibi sosyal oyunlara', 'ilgi göstermiyor.']),
  item(4, 'green', [['İlgisini çeken', 'D'], ['şeyi size', 'D'], ['göstermek için', 'L'], ['işaret etmiyor.', 'D', true]], 116, [
    'Sizin gösterdiğiniz',
    'yere de bakmıyor.',
  ]),
  item(5, 'cream', [['El sallama,', 'D'], ['alkış gibi', 'D'], ['hareketleri', 'L'], ['taklit etmekte', 'L'], ['zorlanıyor.', 'D', true]], 116),
  tek(),
  feel(),
  gozlem(),
  outro(),
];
