// The last message grows into a full-screen statement card, then the brand outro ("contact card").
import React from 'react';
import {interpolate, Easing} from 'remotion';
import {C, FONT} from '../../shared/brand';
import {Avatar} from './chrome';
import {FIN_BUBBLE_W, FinalText} from './chat';
import {BUB, CARD_AT, EXPAND_AT, FIN, FIN_SCALE0, LAST, LAYOUT, OUTRO_AT, SPR, W, H, screenY, sp} from './timeline';

const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

const CARD_X = 104;
const TEXT_H = LAST.lines.length * FIN.cardFont * FIN.lhRatio;
const CARD_Y = 860 - TEXT_H / 2;

export const Statement: React.FC<{f: number}> = ({f}) => {
  if (f < EXPAND_AT) return null;
  const e = interpolate(f, [EXPAND_AT, CARD_AT], [0, 1], {...CL, easing: Easing.bezier(0.65, 0, 0.2, 1)});
  const et = interpolate(f, [EXPAND_AT + 2, CARD_AT + 4], [0, 1], {...CL, easing: Easing.bezier(0.6, 0, 0.2, 1)});

  // live start rect of the bubble (identical to the in-list bubble at EXPAND_AT)
  const x0 = LAYOUT.colL;
  const y0 = screenY(LAST.y, f);
  const x = lerp(x0, 0, e);
  const y = lerp(y0, 0, e);
  const w = lerp(FIN_BUBBLE_W, W, e);
  const h = lerp(LAST.h, H, e);
  const r = lerp(BUB.radius, 0, e);
  const rt = lerp(BUB.tail, 0, e);

  const s = lerp(FIN_SCALE0, 1, et);
  const tx = lerp(x0 + BUB.padX, CARD_X, et);
  const ty = lerp(y0 + BUB.padT + 6, CARD_Y, et);
  const metaO = interpolate(f, [EXPAND_AT, EXPAND_AT + 6], [1, 0], CL);

  // outro: statement lifts away
  const exit = interpolate(f, [OUTRO_AT, OUTRO_AT + 12], [0, 1], {...CL, easing: Easing.in(Easing.cubic)});

  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        borderRadius: `${r}px ${r}px ${r}px ${rt}px`,
        background: C.green,
        overflow: 'hidden',
        boxShadow: `0 10px 28px rgba(11,32,28,${0.2 * (1 - e)})`,
      }}
    >
      {/* soft light from the top so the card is not a flat slab */}
      <div
        style={{
          position: 'absolute',
          left: -x,
          top: -y,
          width: W,
          height: H,
          background: `radial-gradient(120% 70% at 30% 18%, rgba(244,246,243,0.07) 0%, rgba(244,246,243,0) 60%), linear-gradient(180deg, rgba(11,32,28,0) 55%, rgba(11,32,28,0.55) 100%)`,
          opacity: e,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: tx - x,
          top: ty - y - 60 * exit,
          transform: `scale(${s})`,
          transformOrigin: '0 0',
          opacity: 1 - exit,
        }}
      >
        <FinalText m={LAST} f={f} />
      </div>
      <div
        style={{
          position: 'absolute',
          right: BUB.padX,
          bottom: BUB.padB,
          fontFamily: FONT.body,
          fontSize: 28,
          fontWeight: 500,
          color: C.sage,
          opacity: 0.85 * metaO,
        }}
      >
        {LAST.time}
      </div>
    </div>
  );
};

export const Outro: React.FC<{f: number}> = ({f}) => {
  const t = f - OUTRO_AT;
  if (t < 0) return null;
  const av = sp(t - 14, SPR.pop);
  const avO = interpolate(t, [14, 19], [0, 1], CL);
  const basak = interpolate(t, [16, 50], [0, 1], CL);
  const nm = sp(t - 24, SPR.soft);
  const bub = sp(t - 36, SPR.pop);
  const bubO = interpolate(t, [36, 41], [0, 1], CL);
  return (
    <div style={{position: 'absolute', inset: 0}}>
      <div
        style={{
          position: 'absolute',
          left: W / 2 - 125,
          top: 560,
          transform: `scale(${0.5 + 0.5 * av})`,
          transformOrigin: '50% 50%',
          opacity: avO,
        }}
      >
        <Avatar size={250} ring={C.sage} progress={basak} />
      </div>
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: W,
          top: 870,
          textAlign: 'center',
          fontFamily: FONT.heading,
          fontWeight: 650,
          fontSize: 86,
          letterSpacing: -1.5,
          color: C.cream,
          opacity: nm,
          transform: `translateY(${(1 - nm) * 30}px)`,
        }}
      >
        Hasat Özel Eğitim
      </div>
      <div style={{position: 'absolute', left: 0, width: W, top: 1030, display: 'flex', justifyContent: 'center'}}>
        <div
          style={{
            padding: '26px 44px 28px',
            borderRadius: `${BUB.radius}px ${BUB.radius}px ${BUB.radius}px ${BUB.tail}px`,
            background: C.cream,
            color: C.green,
            fontFamily: FONT.body,
            fontWeight: 500,
            fontSize: 50,
            letterSpacing: -0.3,
            whiteSpace: 'nowrap',
            transform: `translateY(${(1 - bub) * 24}px) scale(${0.45 + 0.55 * bub})`,
            transformOrigin: '0% 100%',
            opacity: bubO,
            boxShadow: '0 12px 30px rgba(0,0,0,0.18)',
          }}
        >
          Yazının tamamı blogumuzda.
        </div>
      </div>
    </div>
  );
};
