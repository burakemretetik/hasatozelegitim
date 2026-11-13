import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {COL, EASE, EASE_OUT, prog} from '../theme';
import {Grid, Line, Rule, Tag} from '../parts';
import {IN} from '../timeline';

// hourglass geometry (own frame, centred on CX,CY)
const CX = 540;
const CY = 560;
const HW = 200; // half width of the bulbs
const HH = 272; // height of each bulb
const TOP = CY - HH;
const BOT = CY + HH;

const halfW = (dy: number) => (HW * dy) / HH; // half width at distance dy from the neck
const areaTop = (level: number) => (HW * (CY - level) ** 2) / HH; // sand below `level` in the upper bulb
const A0 = areaTop(TOP + 46);

/** Tip 2 – an hourglass built from two triangles; it flips in two 90° steps, then circles stream down. */
export const Tip2: React.FC = () => {
  const f = useCurrentFrame();
  const appear = prog(f, IN - 6, 16, EASE_OUT);
  const rot = 180 - 90 * prog(f, IN + 2, 14, EASE) - 90 * prog(f, IN + 22, 14, EASE);
  const FLOW = IN + 40;
  const flow = interpolate(f, [FLOW, FLOW + 130], [0, 0.82], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});

  // upper sand level from remaining area
  const aTop = A0 * (1 - flow);
  const lt = CY - Math.sqrt((aTop * HH) / HW);
  // lower sand height from moved area: A = HW*d*(2HH-d)/HH
  const moved = A0 * flow;
  const d = HH - Math.sqrt(Math.max(0, HH * HH - (moved * HH) / HW));
  const lb = BOT - d;

  // stream of grains
  const flowing = f >= FLOW && flow < 0.82;
  const head = CY + (f - FLOW) * 22;
  const gap = 30;
  const phase = ((f - FLOW) * 9) % gap;
  const grains: number[] = [];
  if (flowing) for (let y = CY + 18 + phase; y < Math.min(head, lb - 8); y += gap) grains.push(y);

  const wt = halfW(CY - lt);
  const wb = halfW(lb - CY);

  return (
    <AbsoluteFill style={{background: COL.orange}}>
      <Grid color={COL.ink} opacity={0.14} at={IN - 8} />

      <svg width={1080} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        <g transform={`translate(${CX} ${CY}) rotate(${rot}) scale(${0.85 + 0.15 * appear}) translate(${-CX} ${-CY})`} opacity={appear}>
          {/* sand */}
          <path d={`M ${CX - wt} ${lt} L ${CX + wt} ${lt} L ${CX} ${CY} Z`} fill={COL.paper} />
          {d > 0.5 && <path d={`M ${CX - HW} ${BOT} L ${CX + HW} ${BOT} L ${CX + wb} ${lb} L ${CX - wb} ${lb} Z`} fill={COL.paper} />}
          {grains.map((y, i) => (
            <circle key={i} cx={CX} cy={y} r={7} fill={COL.paper} />
          ))}
          {/* glass: two triangles */}
          <path
            d={`M ${CX - HW} ${TOP} L ${CX + HW} ${TOP} L ${CX} ${CY} Z M ${CX} ${CY} L ${CX + HW} ${BOT} L ${CX - HW} ${BOT} Z`}
            fill="none"
            stroke={COL.ink}
            strokeWidth={10}
            strokeLinejoin="miter"
          />
          {/* caps */}
          <rect x={CX - HW - 50} y={TOP - 30} width={2 * HW + 100} height={30} fill={COL.ink} />
          <rect x={CX - HW - 50} y={BOT} width={2 * HW + 100} height={30} fill={COL.ink} />
        </g>
      </svg>

      <Tag n="2" at={IN} x={80} y={936} bg={COL.ink} fg={COL.orange} />
      <Rule at={IN + 6} x={204} y={984} w={736} color={COL.ink} h={4} />

      <div style={{position: 'absolute', left: 80, top: 1070}}>
        <Line at={IN + 8} size={108} weight={800}>
          Kum saati ya da
        </Line>
        <Line at={IN + 13} size={108} weight={800}>
          zamanlayıcı
        </Line>
        <Line at={IN + 18} size={108} weight={300}>
          kullanın.
        </Line>
      </div>
    </AbsoluteFill>
  );
};
