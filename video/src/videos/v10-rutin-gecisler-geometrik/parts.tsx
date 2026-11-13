import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COL, EASE, EASE_OUT, EASE_WIPE, FF, prog} from './theme';
import {WIPE} from './timeline';

/** One line of type that slides up out of a mask (Swiss kinetic reveal). */
export const Line: React.FC<{
  at: number;
  size: number;
  weight?: number;
  color?: string;
  dur?: number;
  lh?: number;
  track?: number;
  style?: React.CSSProperties;
  children: React.ReactNode;
}> = ({at, size, weight = 400, color = COL.ink, dur = 18, lh = 1.04, track, style, children}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, dur, EASE_OUT);
  return (
    <div
      style={{
        fontFamily: FF,
        fontSize: size,
        fontWeight: weight,
        lineHeight: lh,
        color,
        letterSpacing: track ?? (size >= 90 ? '-0.025em' : size >= 64 ? '-0.012em' : '0em'),
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        padding: '0.22em 0.15em 0.26em 0',
        margin: '-0.22em -0.15em -0.26em 0',
        ...style,
      }}
    >
      <div style={{transform: `translateY(${(1 - p) * 150}%)`}}>{children}</div>
    </div>
  );
};

/** Faint modular grid – the visible structure of every poster. */
export const Grid: React.FC<{color: string; at?: number; opacity?: number}> = ({color, at = 0, opacity = 0.16}) => {
  const f = useCurrentFrame();
  const xs = [80, 295, 510, 725, 940];
  const ys = [220, 1520];
  return (
    <AbsoluteFill style={{opacity}}>
      {xs.map((x, i) => {
        const p = prog(f, at + i * 2, 22, EASE);
        return (
          <div
            key={'x' + i}
            style={{position: 'absolute', left: x - 1, top: 0, width: 2, height: 1920 * p, background: color}}
          />
        );
      })}
      {ys.map((y, i) => {
        const p = prog(f, at + 4 + i * 3, 24, EASE);
        return (
          <div key={'y' + i} style={{position: 'absolute', top: y - 1, left: 0, height: 2, width: 1080 * p, background: color}} />
        );
      })}
    </AbsoluteFill>
  );
};

/** Numbered square tag that rotates in by a 90° step. */
export const Tag: React.FC<{n: string; at: number; x: number; y: number; bg: string; fg: string; size?: number}> = ({
  n,
  at,
  x,
  y,
  bg,
  fg,
  size = 96,
}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, 16, EASE_OUT);
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: size,
        height: size,
        background: bg,
        transform: `rotate(${(1 - p) * -90}deg) scale(${0.4 + 0.6 * p})`,
        opacity: p > 0 ? 1 : 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FF,
        fontWeight: 700,
        fontSize: size * 0.66,
        color: fg,
        lineHeight: 1,
      }}
    >
      <span style={{transform: 'translateY(-0.03em)'}}>{n}</span>
    </div>
  );
};

/** Horizontal rule drawn from the left. */
export const Rule: React.FC<{at: number; x: number; y: number; w: number; color: string; h?: number; dur?: number}> = ({
  at,
  x,
  y,
  w,
  color,
  h = 4,
  dur = 20,
}) => {
  const f = useCurrentFrame();
  const p = prog(f, at, dur, EASE);
  return <div style={{position: 'absolute', left: x, top: y - h / 2, width: w * p, height: h, background: color}} />;
};

/**
 * Column-shutter wipe: the incoming scene is revealed top-down in 4 staggered columns,
 * each led by a solid bar of `bar` colour. Frame is local to the incoming scene.
 */
export const WipeIn: React.FC<{bar: string; reverse?: boolean; children: React.ReactNode}> = ({bar, reverse, children}) => {
  const f = useCurrentFrame();
  if (f >= WIPE) return <AbsoluteFill>{children}</AbsoluteFill>;
  const cols = 4;
  const w = 1080 / cols;
  const colDur = 17;
  const stagger = (WIPE - colDur) / (cols - 1);
  const H = 1920 + 90; // overshoot so the leading bar leaves the frame
  const hs = Array.from({length: cols}, (_, i) => {
    const k = reverse ? cols - 1 - i : i;
    return prog(f, k * stagger, colDur, EASE_WIPE) * H;
  });
  let pts = `0px 0px, 0px ${hs[0]}px`;
  for (let i = 0; i < cols; i++) {
    pts += `, ${i * w}px ${hs[i]}px, ${(i + 1) * w}px ${hs[i]}px`;
  }
  pts += `, 1080px 0px`;
  return (
    <AbsoluteFill style={{clipPath: `polygon(${pts})`}}>
      {children}
      {hs.map((h, i) => (
        <div key={i} style={{position: 'absolute', left: i * w, width: w + 1, top: h - 90, height: 90, background: bar}} />
      ))}
    </AbsoluteFill>
  );
};
