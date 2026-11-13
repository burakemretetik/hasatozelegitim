import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COL, EASE, EASE_OUT, mix, morphPath, prog, ShapeKind} from '../theme';
import {Grid, Line, Rule} from '../parts';
import {IN} from '../timeline';

const COLS = 6;
const ROWS = 4;
const P = 140;
const X0 = 155;
const Y0 = 320;
const R = 42;

// timings (local frames)
export const FLEX_T = {
  head: IN + 4,
  para: IN + 54,
  previewA: IN + 92,
  changeA: IN + 106,
  ex1: IN + 168,
  ex2: IN + 196,
  previewB: IN + 196,
  changeB: IN + 210,
};

type Change = {r: number; c: number; to: ShapeKind; color: string; preview: number; at: number};
const CHANGES: Change[] = [
  {r: 1, c: 3, to: 'square', color: COL.orange, preview: FLEX_T.previewA, at: FLEX_T.changeA},
  {r: 2, c: 1, to: 'triangle', color: COL.brick, preview: FLEX_T.previewB, at: FLEX_T.changeB},
];

/** Flexibility – a stable grid of identical circles; one cell at a time gently changes. */
export const Flex: React.FC = () => {
  const f = useCurrentFrame();

  return (
    <AbsoluteFill style={{background: COL.paper}}>
      <Grid color={COL.ink} opacity={0.12} at={IN - 8} />
      <svg width={1080} height={900} style={{position: 'absolute', left: 0, top: 0}}>
        {Array.from({length: COLS * ROWS}, (_, i) => {
          const c = i % COLS;
          const r = Math.floor(i / COLS);
          const cx = X0 + c * P;
          const cy = Y0 + r * P;
          const p = prog(f, IN - 6 + (r + c) * 2.2, 14, EASE_OUT);
          const ch = CHANGES.find((k) => k.r === r && k.c === c);
          let d = morphPath('circle', 'circle', 0, cx, cy, R * p);
          let fill: string = COL.ink;
          if (ch) {
            const t = prog(f, ch.at, 30, EASE);
            d = morphPath('circle', ch.to, t, cx, cy, R * p);
            fill = mix(t, COL.ink, ch.color);
          }
          return <path key={i} d={d} fill={fill} />;
        })}
        {/* "show it in advance": an outline preview frames the cell before it changes */}
        {CHANGES.map((ch, k) => {
          const cx = X0 + ch.c * P;
          const cy = Y0 + ch.r * P;
          const pin = prog(f, ch.preview, 14, EASE_OUT);
          const pout = prog(f, ch.at + 34, 14, EASE);
          const s = 0.7 + 0.3 * pin;
          const half = 62 * s;
          return (
            <rect
              key={k}
              x={cx - half}
              y={cy - half}
              width={half * 2}
              height={half * 2}
              fill="none"
              stroke={ch.color}
              strokeWidth={6}
              opacity={pin * (1 - pout)}
            />
          );
        })}
      </svg>

      <Rule at={IN} x={80} y={846} w={860} color={COL.ink} h={4} />

      <div style={{position: 'absolute', left: 80, top: 880}}>
        <Line at={FLEX_T.head} size={104} weight={800}>
          Esnekliği de
        </Line>
        <Line at={FLEX_T.head + 5} size={104} weight={800}>
          öğretin.
        </Line>
      </div>
      <div style={{position: 'absolute', left: 80, top: 1150}}>
        <Line at={FLEX_T.para} size={52} weight={400} lh={1.2} color={COL.text2}>
          Küçük değişiklikleri önceden
        </Line>
        <Line at={FLEX_T.para + 5} size={52} weight={400} lh={1.2} color={COL.text2}>
          gösterin ve birlikte hazırlanın:
        </Line>
      </div>
      <div style={{position: 'absolute', left: 80, top: 1318}}>
        {[
          {at: FLEX_T.ex1, text: 'farklı bir yoldan eve dönmek,', shape: 'square' as const, color: COL.orange},
          {at: FLEX_T.ex2, text: 'yeni bir yemek denemek gibi.', shape: 'triangle' as const, color: COL.brick},
        ].map((e, i) => {
          const bp = prog(f, e.at, 14, EASE_OUT);
          return (
            <div key={i} style={{display: 'flex', alignItems: 'center', height: 70}}>
              <svg width={40} height={40} viewBox="0 0 40 40" style={{marginRight: 22, transform: `rotate(${(1 - bp) * -90}deg) scale(${bp})`}}>
                {e.shape === 'square' ? <rect x={4} y={4} width={32} height={32} fill={e.color} /> : <path d="M20 3 L38 37 L2 37 Z" fill={e.color} />}
              </svg>
              <Line at={e.at + 3} size={52} weight={600}>
                {e.text}
              </Line>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
