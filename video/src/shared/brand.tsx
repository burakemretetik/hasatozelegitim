import React from 'react';
import {Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import './fonts';

/** Hasat brand palette (from the website README). */
export const C = {
  green: '#12312B', // koyu yeşil – metin, koyu bölümler
  greenDeep: '#0B201C',
  orange: '#E8A33D', // turuncu – vurgu, başak taneleri
  orangeDeep: '#A8681A',
  cream: '#F4F6F3', // kırık beyaz – zemin
  text2: '#3E5650', // ikincil metin
  panel: '#E3ECE7', // açık panel
  line: '#D9E0DC',
  line2: '#C9D3CE',
  sage: '#B9C9C3', // logo alt yazısı (koyu zemin)
} as const;

export const FONT = {
  heading: "'Bricolage Grotesque', sans-serif", // brand headings (use weight 650)
  body: "'Inter', sans-serif", // brand body text
  serif: "'Fraunces', serif",
  serifDisplay: "'DM Serif Display', serif",
  hand: "'Caveat', cursive",
  grotesk: "'Space Grotesk', sans-serif",
  geometric: "'Outfit', sans-serif",
  mono: "'IBM Plex Mono', monospace",
  rounded: "'Nunito', sans-serif",
} as const;

export const VIDEO = {width: 1080, height: 1920, fps: 30} as const;

/**
 * Safe zone for vertical social video (Reels / TikTok / Shorts).
 * Keep important text inside: top 220px and bottom 400px are covered by app UI,
 * right 140px by the action buttons. Left margin 80px.
 */
export const SAFE = {top: 220, bottom: 400, left: 80, right: 140} as const;

const GRAIN = 'M0 -6 C 2.4 -3, 2.4 3, 0 6 C -2.4 3, -2.4 -3, 0 -6 Z';
const GRAINS: Array<[number, number, number]> = [
  [20, 6.5, 0],
  [16.2, 12.9, -32],
  [23.8, 12.9, 32],
  [16.2, 19.4, -32],
  [23.8, 19.4, 32],
  [16.2, 25.9, -32],
  [23.8, 25.9, 32],
];

/**
 * The Hasat wheat-ear mark ("başak") as inline SVG (viewBox 0 0 40 40).
 * `progress` 0..1 animates: stem draws up, then the 7 grains pop in from the bottom up.
 * Leave `progress` undefined (or 1) for the static mark.
 */
export const Basak: React.FC<{
  size?: number;
  progress?: number;
  stem?: string;
  grain?: string;
  style?: React.CSSProperties;
}> = ({size = 120, progress = 1, stem = C.green, grain = C.orange, style}) => {
  const p = Math.max(0, Math.min(1, progress));
  const stemP = interpolate(p, [0, 0.35], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  // grains appear bottom-up
  const appearIndex = [6, 4, 5, 2, 3, 0, 1];
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" style={style}>
      <path
        d="M20 38.5 V13.5"
        fill="none"
        stroke={stem}
        strokeWidth={1.1}
        strokeLinecap="round"
        strokeDasharray={25}
        strokeDashoffset={25 * (1 - stemP)}
      />
      {GRAINS.map(([x, y, r], i) => {
        const k = appearIndex[i];
        const start = 0.3 + k * 0.09;
        const s = interpolate(p, [start, start + 0.14], [0, 1], {
          extrapolateLeft: 'clamp',
          extrapolateRight: 'clamp',
        });
        return (
          <path
            key={i}
            transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}
            d={GRAIN}
            fill={grain}
          />
        );
      })}
    </svg>
  );
};

/** Official horizontal logo (mark + "Hasat / ÖZEL EĞİTİM" wordmark). Aspect ≈ 2.05:1 */
export const HasatLogo: React.FC<{
  width?: number;
  dark?: boolean; // true = for dark backgrounds (cream text)
  vertical?: boolean;
  style?: React.CSSProperties;
}> = ({width = 420, dark = false, vertical = false, style}) => {
  const file = `brand/hasat-logo-${vertical ? 'dikey' : 'yatay'}${dark ? '-koyu-zemin' : ''}.svg`;
  return <Img src={staticFile(file)} style={{width, height: 'auto', display: 'block', ...style}} />;
};

/** Convenience: spring that starts at `delay` frames. */
export const useSpringAt = (delay: number, config?: {damping?: number; stiffness?: number; mass?: number}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  return spring({frame: frame - delay, fps, config: {damping: 200, ...config}});
};

/** Debug overlay showing the social-video safe zone. Never leave it on in final output. */
export const SafeZoneDebug: React.FC = () => (
  <div style={{position: 'absolute', inset: 0, pointerEvents: 'none'}}>
    <div
      style={{
        position: 'absolute',
        top: SAFE.top,
        bottom: SAFE.bottom,
        left: SAFE.left,
        right: SAFE.right,
        outline: '4px dashed rgba(255,0,80,0.8)',
      }}
    />
  </div>
);
