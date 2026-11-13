import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COL, EASE, EASE_OUT, FF, prog} from '../theme';
import {Grid, Line, Rule, Tag} from '../parts';
import {IN} from '../timeline';

const CX = 600;
const CY = 560;
const R = 290;

const pt = (deg: number, r: number) => {
  const a = ((deg - 90) * Math.PI) / 180;
  return [CX + r * Math.cos(a), CY + r * Math.sin(a)];
};

/** Sector from angle a0 to a1 (degrees clockwise from 12 o'clock). */
const sector = (a0: number, a1: number, r: number) => {
  if (a1 - a0 >= 359.99) return `M ${CX} ${CY - r} A ${r} ${r} 0 1 1 ${CX - 0.01} ${CY - r} Z`;
  if (a1 - a0 <= 0.01) return '';
  const [x0, y0] = pt(a0, r);
  const [x1, y1] = pt(a1, r);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${CX} ${CY} L ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1} Z`;
};

/** Tip 1 – a big 5 and a five-step countdown disc that empties. */
export const Tip1: React.FC = () => {
  const f = useCurrentFrame();
  const discP = prog(f, IN - 4, 20, EASE_OUT);
  const STEP0 = 66;
  const STEP_GAP = 28;
  let steps = 0;
  for (let k = 0; k < 5; k++) steps += prog(f, STEP0 + k * STEP_GAP, 14, EASE);
  const boundary = steps * 72; // degrees removed
  const fiveP = prog(f, IN + 4, 20, EASE_OUT);

  return (
    <AbsoluteFill style={{background: COL.paper}}>
      <Grid color={COL.ink} opacity={0.12} at={IN - 8} />

      <svg width={1080} height={1000} style={{position: 'absolute', left: 0, top: 0}}>
        <g transform={`translate(${CX} ${CY}) scale(${discP}) rotate(${(1 - discP) * -90}) translate(${-CX} ${-CY})`}>
          <circle cx={CX} cy={CY} r={R} fill={COL.panel} />
          <path d={sector(boundary, 360, R)} fill={COL.orange} />
          {/* five one-minute wedges */}
          {[0, 1, 2, 3, 4].map((k) => {
            const [x, y] = pt(k * 72, R + 1);
            return <line key={k} x1={CX} y1={CY} x2={x} y2={y} stroke={COL.paper} strokeWidth={6} />;
          })}
          {/* hand */}
          {(() => {
            const [hx, hy] = pt(boundary, R + 24);
            return <line x1={CX} y1={CY} x2={hx} y2={hy} stroke={COL.ink} strokeWidth={10} />;
          })()}
          <circle cx={CX} cy={CY} r={18} fill={COL.ink} />
        </g>
      </svg>

      {/* big 5 */}
      <div
        style={{
          position: 'absolute',
          left: 70,
          top: 250,
          fontFamily: FF,
          fontWeight: 800,
          fontSize: 640,
          lineHeight: 0.8,
          letterSpacing: '-0.04em',
          color: COL.ink,
          clipPath: `inset(0 ${(1 - fiveP) * 100}% 0 0)`,
        }}
      >
        5
      </div>

      <Tag n="1" at={IN} x={80} y={936} bg={COL.ink} fg={COL.paper} />
      <Rule at={IN + 6} x={204} y={984} w={736} color={COL.ink} h={4} />

      <div style={{position: 'absolute', left: 80, top: 1070}}>
        <Line at={IN + 8} size={116} weight={800}>
          Önceden
        </Line>
        <Line at={IN + 13} size={116} weight={800}>
          haber verin.
        </Line>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 80,
          top: 1342,
          width: 10,
          height: 140 * prog(f, IN + 40, 16, EASE),
          background: COL.orange,
        }}
      />
      <div style={{position: 'absolute', left: 120, top: 1336}}>
        <Line at={IN + 44} size={56} weight={400} color={COL.text2} lh={1.18}>
          “Beş dakika sonra oyun
        </Line>
        <Line at={IN + 49} size={56} weight={400} color={COL.text2} lh={1.18}>
          bitiyor, banyoya gideceğiz.”
        </Line>
      </div>
    </AbsoluteFill>
  );
};
