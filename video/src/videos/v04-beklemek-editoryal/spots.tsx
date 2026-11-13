import React from 'react';
import {interpolate, useCurrentFrame} from 'remotion';
import {ACCENT, DrawPath, EASE_DRAW, EASE_INOUT, EASE_OUT, INK, tween} from './kit';

// Hairline spot illustrations, drawn like a magazine's line-art spots: green ink + one orange accent.

const GLASS_L = 'M 58 30 C 58 96, 97 118, 97 150 C 97 182, 58 204, 58 270';
const GLASS_R = 'M 142 30 C 142 96, 103 118, 103 150 C 103 182, 142 204, 142 270';
const GLASS_CLIP =
  'M 58 30 C 58 96, 97 118, 97 150 C 97 182, 58 204, 58 270 L 142 270 C 142 204, 103 182, 103 150 C 103 118, 142 96, 142 30 Z';

/** Hourglass: sand runs slowly – "beklerken geçen aylar". */
export const Hourglass: React.FC<{at: number; out: number; size?: number}> = ({at, out, size = 300}) => {
  const f = useCurrentFrame();
  const draw = tween(f, at, at + 40, EASE_DRAW);
  const plates = tween(f, at - 4, at + 22, EASE_INOUT);
  const sandIn = tween(f, at + 26, at + 46, EASE_OUT);
  // very slow, calm flow across the whole beat
  const flow = interpolate(f, [at + 30, out + 40], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const leave = tween(f, out, out + 24, EASE_INOUT);

  const topLevel = 70 + flow * 52; // sand surface in the upper bulb (y)
  const pile = 18 + flow * 34; // height of the lower mound
  const id = 'v04hg';
  return (
    <svg
      viewBox="0 0 200 300"
      width={size * (200 / 300)}
      height={size}
      style={{overflow: 'visible', opacity: 1 - leave, transform: `translateY(${(-leave * 60).toFixed(2)}px)`}}
    >
      <defs>
        <clipPath id={id}>
          <path d={GLASS_CLIP} />
        </clipPath>
      </defs>
      {/* sand */}
      <g clipPath={`url(#${id})`} opacity={sandIn}>
        <rect x={40} y={topLevel} width={120} height={150 - topLevel} fill={ACCENT} />
        <path
          d={`M 40 272 L 40 ${272 - pile * 0.35} Q 100 ${272 - pile * 1.65} 160 ${272 - pile * 0.35} L 160 272 Z`}
          fill={ACCENT}
        />
      </g>
      {/* falling grain stream */}
      {sandIn > 0.5 && flow < 1 ? (
        <line x1={100} y1={150} x2={100} y2={272 - pile * 1.0} stroke={ACCENT} strokeWidth={2.4} strokeLinecap="round" opacity={sandIn} />
      ) : null}
      {/* glass */}
      <DrawPath d={GLASS_L} p={draw} width={3} />
      <DrawPath d={GLASS_R} p={draw} width={3} />
      {/* frame: plates + posts */}
      <DrawPath d="M 26 24 H 174" p={plates} width={8} />
      <DrawPath d="M 26 276 H 174" p={plates} width={8} />
      <DrawPath d="M 38 28 V 272" p={draw} width={2.4} />
      <DrawPath d="M 162 28 V 272" p={draw} width={2.4} />
    </svg>
  );
};

/** Seedling with roots in a cross-section of soil – "sağlam bir zemin". */
export const Seedling: React.FC<{at: number; size?: number}> = ({at, size = 300}) => {
  const f = useCurrentFrame();
  const ground = tween(f, at, at + 26, EASE_INOUT);
  const strata = tween(f, at + 8, at + 36, EASE_INOUT);
  const seed = tween(f, at + 14, at + 30, EASE_OUT);
  const root = tween(f, at + 22, at + 52, EASE_DRAW);
  const stem = tween(f, at + 30, at + 70, EASE_DRAW);
  const leafL = tween(f, at + 58, at + 92, EASE_OUT);
  const leafR = tween(f, at + 68, at + 104, EASE_OUT);
  // a gentle, slow sway after it has grown
  const sway = Math.sin((f - at) / 34) * 1.6 * tween(f, at + 90, at + 140, EASE_INOUT);

  const LEAF_L = 'M 0 0 C -18 -6, -48 -26, -60 -56 C -30 -52, -8 -30, 0 0 Z';
  const LEAF_R = 'M 0 0 C 14 -4, 40 -20, 50 -46 C 24 -44, 6 -26, 0 0 Z';
  return (
    <svg viewBox="0 0 220 300" width={size * (220 / 300)} height={size} style={{overflow: 'visible'}}>
      {/* soil cross-section */}
      <DrawPath d="M 8 206 H 212" p={ground} width={3} />
      <DrawPath d="M 30 230 H 82 M 128 230 H 196" p={strata} width={2} opacity={0.55} />
      <DrawPath d="M 52 252 H 166" p={strata} width={2} opacity={0.4} />
      <DrawPath d="M 84 274 H 140" p={strata} width={2} opacity={0.28} />
      {/* seed */}
      <ellipse cx={110} cy={226} rx={9 * seed} ry={6 * seed} fill={ACCENT} transform="rotate(-18 110 226)" />
      {/* roots */}
      <DrawPath d="M 110 230 C 108 244, 116 254, 110 270" p={root} width={2.2} />
      <DrawPath d="M 111 244 C 120 250, 128 252, 134 262" p={root} width={1.8} opacity={0.8} />
      <DrawPath d="M 109 252 C 100 258, 94 262, 90 270" p={root} width={1.8} opacity={0.8} />
      {/* stem + leaves (sway around the ground point) */}
      <g transform={`rotate(${sway.toFixed(3)} 110 206)`}>
        <DrawPath d="M 110 222 C 110 186, 104 150, 110 104" p={stem} width={3} />
        <g transform={`translate(108 132) scale(${leafL.toFixed(3)})`}>
          <path d={LEAF_L} fill="none" stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />
          <path d="M 0 0 C -20 -18, -36 -32, -52 -50" fill="none" stroke={INK} strokeWidth={1.6} opacity={0.6} />
        </g>
        <g transform={`translate(110 108) scale(${leafR.toFixed(3)})`}>
          <path d={LEAF_R} fill={ACCENT} fillOpacity={0.9} stroke={INK} strokeWidth={2.6} strokeLinejoin="round" />
        </g>
      </g>
    </svg>
  );
};
