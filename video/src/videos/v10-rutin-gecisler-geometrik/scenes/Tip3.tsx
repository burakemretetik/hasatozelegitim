import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COL, EASE, EASE_OUT, prog} from '../theme';
import {Grid, Line, Rule, Tag} from '../parts';
import {IN} from '../timeline';

const R = 74;
/** Bauhaus speech bubble: a circle whose lower-left quadrant is a square corner. */
const bubble = (cx: number, cy: number) =>
  `M ${cx} ${cy - R} A ${R} ${R} 0 0 1 ${cx + R} ${cy} A ${R} ${R} 0 0 1 ${cx} ${cy + R} L ${cx - R} ${cy + R} L ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx} ${cy - R} Z`;

const COLS = 4;
const ROWS = 3;
const PX = 205;
const PY = 205;
const X0 = 182;
const Y0 = 340;

/** Tip 3 – one identical bubble stamped again and again in a steady rhythm. */
export const Tip3: React.FC = () => {
  const f = useCurrentFrame();
  const BEAT = 5;
  const START = IN - 2;
  const allIn = START + COLS * ROWS * BEAT + 14;

  return (
    <AbsoluteFill style={{background: COL.paper}}>
      <Grid color={COL.ink} opacity={0.12} at={IN - 8} />
      <svg width={1080} height={1000} style={{position: 'absolute', left: 0, top: 0}}>
        {Array.from({length: COLS * ROWS}, (_, i) => {
          const c = i % COLS;
          const r = Math.floor(i / COLS);
          const cx = X0 + c * PX;
          const cy = Y0 + r * PY;
          const at = START + i * BEAT;
          const p = prog(f, at, 12, EASE_OUT);
          const bar = prog(f, at + 6, 10, EASE);
          // a soft wave of emphasis that keeps the rhythm going once the grid is full
          const wave = f > allIn ? Math.max(0, Math.sin(((f - allIn) / 40) * Math.PI * 2 - i * 0.55)) : 0;
          const pulse = 1 + 0.045 * wave * wave;
          const s = (0.5 + 0.5 * p) * pulse;
          return (
            <g key={i} opacity={p > 0 ? 1 : 0} transform={`translate(${cx} ${cy}) rotate(${(1 - p) * -90}) scale(${s}) translate(${-cx} ${-cy})`}>
              <path d={bubble(cx, cy)} fill={COL.brick} />
              {/* the same short sentence: two text lines */}
              <rect x={cx - 42} y={cy - 20} width={86 * bar} height={13} fill={COL.paper} />
              <rect x={cx - 42} y={cy + 6} width={50 * prog(f, at + 10, 10, EASE)} height={13} fill={COL.paper} />
            </g>
          );
        })}
      </svg>

      <Tag n="3" at={IN} x={80} y={936} bg={COL.ink} fg={COL.paper} />
      <Rule at={IN + 6} x={204} y={984} w={736} color={COL.ink} h={4} />

      <div style={{position: 'absolute', left: 80, top: 1070}}>
        <Line at={IN + 8} size={104} weight={300}>
          Her geçişte
        </Line>
        <Line at={IN + 13} size={104} weight={800} color={COL.brick}>
          aynı kısa cümleyi
        </Line>
        <Line at={IN + 18} size={104} weight={300}>
          tekrarlayın.
        </Line>
      </div>
    </AbsoluteFill>
  );
};
