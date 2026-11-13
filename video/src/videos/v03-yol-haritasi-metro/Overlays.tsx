/** Screen-space layers: current-line HUD, closing card, brand outro. */
import React from 'react';
import {AbsoluteFill, Easing, interpolate, spring} from 'remotion';
import {C, FONT, HasatLogo} from '../../shared/brand';
import * as T from './timeline';
import {LINE} from './map';
import {BadgeHtml} from './Labels';

const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const F = FONT.geometric;
const sp = (f: number, start: number, dur = 14) =>
  spring({frame: f - start, fps: 30, config: {damping: 200}, durationInFrames: dur});

const HUD_STATES: Array<{from: number; to: number; line: 'G' | 'TR' | 'DE'; name: string}> = [
  {from: T.HUD_G, to: T.HUD_TR, line: 'G', name: 'Gözlem hattı'},
  {from: T.HUD_TR, to: T.HUD_DE, line: 'TR', name: 'Türkiye hattı'},
  {from: T.HUD_DE, to: T.HUD_OUT, line: 'DE', name: 'Almanya hattı'},
];

/** "Now travelling on" indicator, like the line display inside a train. */
export const Hud: React.FC<{f: number}> = ({f}) => (
  <>
    {HUD_STATES.map((s) => {
      const a = sp(f, s.from, 14);
      const b = sp(f, s.to, 12);
      const o = a * (1 - b);
      if (o <= 0.001) return null;
      return (
        <div
          key={s.line}
          style={{
            position: 'absolute',
            left: 80,
            top: 234,
            height: 92,
            display: 'flex',
            alignItems: 'center',
            gap: 22,
            padding: '0 40px 0 14px',
            borderRadius: 46,
            background: C.green,
            opacity: o,
            transform: `translateY(${(1 - a) * 26 - b * 26}px)`,
          }}
        >
          <BadgeHtml line={s.line} size={66} />
          <div style={{fontFamily: F, fontWeight: 600, fontSize: 46, color: C.cream, whiteSpace: 'nowrap'}}>{s.name}</div>
        </div>
      );
    })}
  </>
);

/** Closing line on a card over the dimmed overview map. */
export const Closing: React.FC<{f: number}> = ({f}) => {
  const veil = Math.max(
    interpolate(f, [T.CL_START - 6, T.CL_START + 12], [0, 0.84], CL),
    interpolate(f, [T.OUTRO, T.OUTRO + 14], [0, 1], CL),
  );
  if (veil <= 0) return null;
  const s = sp(f, T.CL_START, 18);
  const out = interpolate(f, [T.CL_END, T.CL_END + 10], [1, 0], CL);
  return (
    <AbsoluteFill>
      <AbsoluteFill style={{background: C.cream, opacity: veil}} />
      {out > 0 ? (
        <div style={{position: 'absolute', left: 80, right: 140, top: 220, bottom: 400, display: 'flex', alignItems: 'center'}}>
          <div
            style={{
              width: '100%',
              boxSizing: 'border-box',
              background: '#FFFFFF',
              border: `4px solid ${C.line2}`,
              borderRadius: 40,
              padding: '50px 50px 58px',
              opacity: s * out,
              transform: `translateY(${(1 - s) * 40}px)`,
            }}
          >
            <div style={{display: 'flex', gap: 12, marginBottom: 36}}>
              {[LINE.G, LINE.TR, LINE.DE].map((c, i) => (
                <div key={c} style={{width: 92, height: 18, borderRadius: 9, background: c, transformOrigin: '0 50%', transform: `scaleX(${sp(f, T.CL_START + 6 + i * 4, 16)})`}} />
              ))}
            </div>
            <div
              style={{
                fontFamily: F,
                fontWeight: 600,
                fontSize: 80,
                lineHeight: 1.13,
                whiteSpace: 'nowrap',
                letterSpacing: '-0.015em',
                color: C.green,
              } as React.CSSProperties}
            >
              <div>Bir uzmana danışmak</div>
              <div>çocuğunuza etiket</div>
              <div>koymak değil,</div>
              <div style={{color: C.orangeDeep}}>onu daha iyi tanımak</div>
              <div>demektir.</div>
            </div>
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** Brand outro: the three lines run through a station sign that carries the Hasat logo. */
export const Outro: React.FC<{f: number}> = ({f}) => {
  const o = f - T.OUTRO;
  if (o < 0) return null;
  const Y = 800;
  const board = spring({frame: o - 8, fps: 30, config: {damping: 14, stiffness: 140}});
  const txt = sp(f, T.OUTRO + 12, 14);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {[LINE.G, LINE.TR, LINE.DE].map((c, i) => {
          const p = interpolate(o, [2 + i * 3, 26 + i * 3], [0, 1], {...CL, easing: Easing.out(Easing.cubic)});
          const y = Y + (i - 1) * 60;
          return (
            <line
              key={c}
              x1={-40}
              x2={1120}
              y1={y}
              y2={y}
              stroke={c}
              strokeWidth={30}
              strokeLinecap="round"
              strokeDasharray={`${p * 1160} 2000`}
            />
          );
        })}
      </svg>
      <div
        style={{
          position: 'absolute',
          left: 540 - 370,
          top: Y - 170,
          width: 740,
          height: 340,
          boxSizing: 'border-box',
          background: '#FFFFFF',
          border: `12px solid ${C.green}`,
          borderRadius: 48,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          opacity: Math.min(1, board * 1.4),
          transform: `scale(${0.82 + 0.18 * board})`,
        }}
      >
        <HasatLogo width={500} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 80,
          right: 80,
          top: Y + 250,
          textAlign: 'center',
          fontFamily: F,
          fontWeight: 500,
          fontSize: 56,
          color: C.green,
          opacity: txt,
          transform: `translateY(${(1 - txt) * 20}px)`,
        }}
      >
        Yazının tamamı blogumuzda.
      </div>
    </AbsoluteFill>
  );
};
