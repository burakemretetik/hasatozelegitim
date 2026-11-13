import React from 'react';
import {AbsoluteFill, Easing, interpolate, useCurrentFrame} from 'remotion';
import {C, FONT, SafeZoneDebug} from '../../shared/brand';
import {Pose, Step, THROW, clamp01, ez, poseAt, prog, sp} from './anim';
import {CH, Card3D} from './Card3D';
import {CARDS, CLOSING, HOOK, SOURCES, Seg} from './content';
import {BrandFace, CoverFace, FactFace, MythFace} from './faces';
import {
  BRAND_IN,
  CLOSE_IN,
  CLOSE_TEXT,
  COUNTER_IN,
  COVER_IN,
  COVER_OUT,
  END,
  FAN_IN,
  FLIP,
  GATHER,
  HL_DELAY,
  HOOK_IN,
  HOOK_OUT,
  OUT,
  OUTRO,
  STAMP_DELAY,
  STRIKE_LEAD,
} from './timing';

export const meta = {
  id: 'v05',
  durationInFrames: END,
  coverFrame: 236,
};

const DEBUG = true;

// ---------- layout ----------
const CX = 540;
const CY = 850;
const LEFT = 130; // card left edge, also the text alignment axis
const slot = (k: number): Partial<Pose> => {
  const s = 1 - 0.045 * k;
  return {x: CX, y: CY + (CH / 2) * (1 - s) + 30 * k, s, r: 0, dark: 0.15 * k};
};
const FAN: Array<Partial<Pose>> = [
  {x: 540, y: 1150, r: 0, s: 0.52},
  {x: 296, y: 1205, r: -11, s: 0.47},
  {x: 784, y: 1205, r: 11, s: 0.47},
];

// ---------- poses ----------
const cardPose = (frame: number, k: number): Pose => {
  const f = FAN[k];
  const init: Pose = {x: f.x!, y: 2400, s: f.s!, r: f.r! * 2.6, ay: 0, blur: 6, dark: 0.14, op: 1};
  const steps: Step[] = [
    {at: FAN_IN + [0, 5, 9][k], to: {y: f.y, r: f.r}, p: sp({damping: 15, stiffness: 70})},
    {at: GATHER + k * 3, to: {...slot(k)}, p: sp({damping: 18, stiffness: 85})},
    {at: COVER_OUT - 12, to: {blur: 0}, p: ez(10)},
    {at: FLIP[k] - 9, to: {ay: -9}, p: ez(9)},
    {at: FLIP[k], to: {ay: 180}, p: sp({damping: 12.5, stiffness: 100})},
    {at: OUT[k], to: {x: -820, y: CY + 80, r: -15}, p: ez(24, THROW)},
    {at: CLOSE_IN + k * 6, to: {...f, blur: 4.5, dark: 0.1}, p: sp({damping: 16, stiffness: 80})},
    {at: OUTRO + 4 + k * 2, to: {...slot(k), blur: 6}, p: sp({damping: 18, stiffness: 85})},
  ];
  for (let j = 0; j < k; j++) {
    steps.push({at: OUT[j] + 8 + (k - j - 1) * 3, to: slot(k - j - 1), p: sp({damping: 14, stiffness: 120})});
  }
  return poseAt(frame, init, steps);
};

const dropPose = (frame: number, at: number, outAt?: number): Pose =>
  poseAt(frame, {x: CX, y: CY - 110, s: 1.22, r: 4, ay: 0, blur: 0, dark: 0, op: 0}, [
    {at, to: {op: 1}, p: ez(4)},
    {at, to: {y: CY, s: 1, r: 0}, p: sp({damping: 15, stiffness: 140})},
    ...(outAt !== undefined ? [{at: outAt, to: {x: -820, y: CY - 60, r: -16}, p: ez(26, THROW)}] : []),
  ]);

// ---------- background ----------
const Background: React.FC<{frame: number}> = ({frame}) => {
  const lx = 540 + Math.sin(frame / 70) * 50;
  const ly = 820 + Math.cos(frame / 90) * 40;
  return (
    <AbsoluteFill style={{background: 'radial-gradient(120% 78% at 50% 42%, #1D473E 0%, #15392F 36%, #0E2823 68%, #091B17 100%)'}}>
      <AbsoluteFill style={{background: `radial-gradient(560px 640px at ${lx}px ${ly}px, rgba(232,163,61,0.075), rgba(232,163,61,0) 70%)`}} />
      <AbsoluteFill style={{background: 'radial-gradient(130% 90% at 50% 45%, rgba(0,0,0,0) 55%, rgba(0,0,0,0.38) 100%)'}} />
    </AbsoluteFill>
  );
};

// ---------- text block (hook / closing) ----------
const TextBlock: React.FC<{
  frame: number;
  lines: Seg[][];
  top: number;
  size: number;
  inAt: number;
  outAt: number;
  base: string;
  accent: string;
}> = ({frame, lines, top, size, inAt, outAt, base, accent}) => (
  <div style={{position: 'absolute', left: LEFT, top, fontFamily: FONT.heading, fontWeight: 650, fontSize: size, lineHeight: 1.1, letterSpacing: '-0.015em'}}>
    {lines.map((line, i) => {
      const pin = sp({damping: 20, stiffness: 120})(frame - (inAt + i * 4));
      const pout = prog(frame, outAt + i * 2, 14, Easing.in(Easing.cubic));
      return (
        <div
          key={i}
          style={{
            whiteSpace: 'pre',
            transform: `translateY(${(1 - pin) * 56 - pout * 70}px)`,
            opacity: clamp01(pin * 1.5) * (1 - pout),
          }}
        >
          {line.map((s, j) => (
            <span key={j} style={{color: s.hl ? accent : base}}>
              {s.t}
            </span>
          ))}
        </div>
      );
    })}
  </div>
);

// ---------- counter ----------
const Counter: React.FC<{frame: number}> = ({frame}) => {
  const pin = sp({damping: 18, stiffness: 120})(frame - COUNTER_IN);
  const pout = prog(frame, OUT[2] + 4, 14, Easing.in(Easing.cubic));
  if (pin <= 0.001 || pout >= 1) return null;
  const roll = [0, 1].reduce((n, j) => n + sp({damping: 16, stiffness: 140})(frame - (OUT[j] + 10)), 0);
  const DH = 78;
  return (
    <div
      style={{
        position: 'absolute',
        left: LEFT + 4,
        top: 236,
        height: DH,
        display: 'flex',
        alignItems: 'center',
        gap: 26,
        opacity: clamp01(pin * 1.4) * (1 - pout),
        transform: `translateY(${(1 - pin) * -24 - pout * 20}px)`,
        fontFamily: FONT.heading,
        fontWeight: 700,
        fontSize: 66,
        lineHeight: 1,
      }}
    >
      <div style={{display: 'flex', alignItems: 'center'}}>
        <div style={{position: 'relative', width: 44, height: DH, overflow: 'hidden'}}>
          {[1, 2, 3].map((d, i) => (
            <div
              key={d}
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: 0,
                height: DH,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: C.orange,
                transform: `translateY(${(i - roll) * DH}px)`,
              }}
            >
              {d}
            </div>
          ))}
        </div>
        <div style={{color: C.sage, marginLeft: 4}}>/3</div>
      </div>
      <div style={{display: 'flex', gap: 12}}>
        {[0, 1, 2].map((j) => {
          const fill = j === 0 ? 1 : clamp01(roll - (j - 1));
          return (
            <div key={j} style={{position: 'relative', width: 58, height: 12, borderRadius: 6, background: 'rgba(185,201,195,0.22)', overflow: 'hidden'}}>
              <div style={{position: 'absolute', left: 0, top: 0, bottom: 0, width: `${fill * 100}%`, borderRadius: 6, background: C.orange}} />
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------- sources ----------
const Sources: React.FC<{frame: number; top: number}> = ({frame, top}) => {
  const pin = sp({damping: 20, stiffness: 110})(frame - (CLOSE_TEXT + 22));
  const pout = prog(frame, OUTRO + 6, 14, Easing.in(Easing.cubic));
  return (
    <div
      style={{
        position: 'absolute',
        left: LEFT,
        top,
        fontFamily: FONT.body,
        fontSize: 32,
        lineHeight: 1.42,
        color: C.sage,
        opacity: clamp01(pin * 1.5) * (1 - pout),
        transform: `translateY(${(1 - pin) * 30 - pout * 50}px)`,
      }}
    >
      <div style={{width: 64, height: 4, borderRadius: 2, background: C.orange, marginBottom: 22, opacity: 0.9}} />
      <div>
        <span style={{fontWeight: 650, color: '#D3DED9'}}>Kaynaklar: </span>
        {SOURCES[0]}
      </div>
      <div>{SOURCES[1]}</div>
    </div>
  );
};

// ---------- main ----------
export const Video: React.FC = () => {
  const frame = useCurrentFrame();
  const hookLines: Seg[][] = HOOK.map((h) => [{t: h.t, hl: h.accent}]);

  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Background frame={frame} />

      {CARDS.map((card, k) => {
        const pose = cardPose(frame, k);
        const strikeAt = FLIP[k] - STRIKE_LEAD;
        const strike = card.myth.map((_, i) => prog(frame, strikeAt + i * 6, 13, Easing.out(Easing.cubic)));
        const stampAt = FLIP[k] + STAMP_DELAY;
        const stamp = frame < stampAt ? 0 : sp({damping: 14, stiffness: 230})(frame - stampAt);
        const press = interpolate(frame, [stampAt + 3, stampAt + 6, stampAt + 16], [0, 1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
        const hl = prog(frame, FLIP[k] + HL_DELAY, 26, Easing.inOut(Easing.cubic));
        return (
          <Card3D
            key={k}
            pose={pose}
            z={40 - k * 10}
            press={press}
            front={<MythFace card={card} strike={strike} />}
            back={<FactFace card={card} stamp={stamp} hl={hl} />}
          />
        );
      })}

      <Card3D pose={dropPose(frame, COVER_IN, COVER_OUT)} z={50} edge="#C98A2E" front={<CoverFace />} />
      <Card3D pose={dropPose(frame, BRAND_IN)} z={60} front={<BrandFace />} />

      <div style={{position: 'absolute', inset: 0, zIndex: 70}}>
        {frame < HOOK_OUT + 30 ? (
          <TextBlock frame={frame} lines={hookLines} top={330} size={82} inAt={HOOK_IN} outAt={HOOK_OUT} base={C.cream} accent={C.orange} />
        ) : null}
        <Counter frame={frame} />
        {frame >= CLOSE_TEXT - 2 ? (
          <>
            <TextBlock frame={frame} lines={CLOSING} top={290} size={96} inAt={CLOSE_TEXT} outAt={OUTRO} base={C.cream} accent={C.orange} />
            <Sources frame={frame} top={290 + 4 * 96 * 1.1 + 40} />
          </>
        ) : null}
      </div>
      {DEBUG ? <SafeZoneDebug /> : null}
    </AbsoluteFill>
  );
};
