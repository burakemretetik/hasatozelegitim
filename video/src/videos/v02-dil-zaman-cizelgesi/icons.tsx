import React from 'react';
import {C} from '../../shared/brand';
import {clamp01} from './anim';

// Line icons, drawn with strokes on a 100×100 grid. `p` = draw progress 0..1, `f` = frame (idle motion).
export type IconProps = {p: number; f: number; size: number; color?: string; accent?: string; weight?: number};
export type IconC = React.FC<IconProps>;

const Svg: React.FC<{size: number; children: React.ReactNode}> = ({size, children}) => (
  <svg width={size} height={size} viewBox="0 0 100 100" fill="none" style={{display: 'block', overflow: 'visible'}}>
    {children}
  </svg>
);

export const Draw: React.FC<{d: string; p: number; color: string; w: number; transform?: string}> = ({d, p, color, w, transform}) =>
  p <= 0.002 ? null : (
    <path
      d={d}
      transform={transform}
      pathLength={1}
      strokeDasharray="1 1"
      strokeDashoffset={1 - clamp01(p)}
      stroke={color}
      strokeWidth={w}
      strokeLinecap="round"
      strokeLinejoin="round"
      fill="none"
    />
  );

/** split one progress value into staggered sub-progresses */
const part = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));

// 12 ay — babbling: a sound wave
export const IconWave: IconC = ({p, f, size, color = C.green, accent = C.orange, weight = 7}) => {
  const H = [18, 36, 58, 40, 70, 34, 16];
  return (
    <Svg size={size}>
      {H.map((h, i) => {
        const pi = part(p, i * 0.08, i * 0.08 + 0.45);
        if (pi <= 0) return null;
        const wob = 1 + 0.09 * Math.sin(f * 0.13 + i * 1.7) * pi;
        const hh = (h * pi * wob) / 2;
        const x = 14 + i * 12;
        return <line key={i} x1={x} x2={x} y1={50 - hh} y2={50 + hh} stroke={i === 4 ? accent : color} strokeWidth={weight} strokeLinecap="round" />;
      })}
    </Svg>
  );
};

// 12 ay — gestures: a waving hand
export const IconHand: IconC = ({p, f, size, color = C.green, accent = C.orange, weight = 5.5}) => {
  const rot = 6 * Math.sin(f * 0.085) * part(p, 0.7, 1);
  return (
    <Svg size={size}>
      <g transform={`rotate(${rot} 56 92)`}>
        <Draw p={part(p, 0, 0.75)} color={color} w={weight} d="M34 68 L22.5 56 A5.5 5.5 0 0 1 30.5 48.5 L34 52 V30 A6 6 0 0 1 46 30 V50" />
        <Draw p={part(p, 0.08, 0.6)} color={color} w={weight} d="M46 31 V22 A6 6 0 0 1 58 22 V50" />
        <Draw p={part(p, 0.16, 0.66)} color={color} w={weight} d="M58 26 A6 6 0 0 1 70 26 V52" />
        <Draw p={part(p, 0.2, 0.9)} color={color} w={weight} d="M70 36 A5 5 0 0 1 80 36 V62 C80 80 68 92 54 92 C44 92 38 86 34 80 V68" />
      </g>
      <Draw p={part(p, 0.6, 0.85)} color={accent} w={weight} d="M86 20 A12 12 0 0 1 91 34" />
      <Draw p={part(p, 0.7, 0.95)} color={accent} w={weight} d="M89 7 A24 24 0 0 1 98 33" />
    </Svg>
  );
};

const BUBBLE = 'M26 14 H74 A14 14 0 0 1 88 28 V52 A14 14 0 0 1 74 66 H46 L28 82 L31 66 H26 A14 14 0 0 1 12 52 V28 A14 14 0 0 1 26 14 Z';

// 16 ay — a speech bubble with one word
export const IconBubble1: IconC = ({p, size, color = C.green, accent = C.orange, weight = 5.5}) => (
  <Svg size={size}>
    <g transform="translate(0 4)">
      <Draw p={part(p, 0, 0.7)} color={color} w={weight} d={BUBBLE} />
      <Draw p={part(p, 0.6, 0.9)} color={accent} w={weight * 1.6} d="M38 40 H62" />
    </g>
  </Svg>
);

// 24 ay — a speech bubble with two words
export const IconBubble2: IconC = ({p, size, color = C.green, accent = C.orange, weight = 5.5}) => (
  <Svg size={size}>
    <g transform="translate(0 4)">
      <Draw p={part(p, 0, 0.7)} color={color} w={weight} d={BUBBLE} />
      <Draw p={part(p, 0.58, 0.8)} color={accent} w={weight * 1.6} d="M27 40 H44" />
      <Draw p={part(p, 0.72, 0.95)} color={accent} w={weight * 1.6} d="M56 40 H73" />
    </g>
  </Svg>
);

// her yaşta — understanding: an ear
export const IconEar: IconC = ({p, f, size, color = C.green, accent = C.orange, weight = 5.5}) => {
  const a = 0.6 + 0.4 * Math.sin(f * 0.12);
  return (
    <Svg size={size}>
      <Draw p={part(p, 0, 0.75)} color={color} w={weight} d="M38 46 C38 26 50 14 64 14 C78 14 88 26 88 41 C88 54 80 59 74 65 C68 71 68 79 62 85 C56 91 46 90 42 84" />
      <Draw p={part(p, 0.3, 0.9)} color={color} w={weight} d="M52 44 C52 33 58 27 65 27 C73 27 77 34 76 41 C75 48 68 50 67 57" />
      <g opacity={0.55 + 0.45 * a * part(p, 0.9, 1) + 0.45 * (1 - part(p, 0.9, 1))}>
        <Draw p={part(p, 0.55, 0.85)} color={accent} w={weight} d="M23 38 A16 16 0 0 0 23 62" />
        <Draw p={part(p, 0.65, 0.95)} color={accent} w={weight} d="M11 30 A28 28 0 0 0 11 70" />
      </g>
    </Svg>
  );
};

const pt = (a: number, r = 30, cx = 50, cy = 50) => [cx + r * Math.cos((a * Math.PI) / 180), cy + r * Math.sin((a * Math.PI) / 180)];
const arc = (a0: number, a1: number) => {
  const [x0, y0] = pt(a0);
  const [x1, y1] = pt(a1);
  return `M${x0.toFixed(2)} ${y0.toFixed(2)} A30 30 0 0 1 ${x1.toFixed(2)} ${y1.toFixed(2)}`;
};
const head = (a: number) => {
  const [x, y] = pt(a);
  const r = (a * Math.PI) / 180;
  const dx = -Math.sin(r);
  const dy = Math.cos(r); // clockwise tangent
  const nx = Math.cos(r);
  const ny = Math.sin(r);
  const L = 11;
  const W = 9;
  return `M${(x - L * dx + W * nx).toFixed(2)} ${(y - L * dy + W * ny).toFixed(2)} L${x.toFixed(2)} ${y.toFixed(2)} L${(x - L * dx - W * nx).toFixed(2)} ${(y - L * dy - W * ny).toFixed(2)}`;
};

// her yaşta — echo: words only repeated
export const IconRepeat: IconC = ({p, f, size, color = C.green, accent = C.orange, weight = 5.5}) => {
  const spin = 10 * Math.sin(f * 0.06) * part(p, 0.9, 1);
  return (
    <Svg size={size}>
      <g transform={`rotate(${spin} 50 50)`}>
        <Draw p={part(p, 0, 0.55)} color={color} w={weight} d={arc(196, 334)} />
        <Draw p={part(p, 0.45, 0.6)} color={color} w={weight} d={head(334)} />
        <Draw p={part(p, 0.2, 0.75)} color={color} w={weight} d={arc(16, 154)} />
        <Draw p={part(p, 0.65, 0.8)} color={color} w={weight} d={head(154)} />
      </g>
      <Draw p={part(p, 0.7, 1)} color={accent} w={weight * 1.6} d="M41 50 H59" />
    </Svg>
  );
};

// warning — a calm alert sign
export const IconAlert: IconC = ({p, size, color = C.orange, weight = 6}) => (
  <Svg size={size}>
    <Draw p={part(p, 0, 0.7)} color={color} w={weight} d="M50 8 A42 42 0 1 1 49.99 8" />
    <Draw p={part(p, 0.55, 0.85)} color={color} w={weight * 1.25} d="M50 28 V56" />
    <Draw p={part(p, 0.85, 1)} color={color} w={weight * 1.5} d="M50 71 V71.5" />
  </Svg>
);
