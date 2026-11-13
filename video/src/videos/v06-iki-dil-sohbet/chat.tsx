// Chat list: topic chip, typing indicator, message bubbles (auto-scrolling).
import React from 'react';
import {interpolate, Easing} from 'remotion';
import {Basak, C, FONT} from '../../shared/brand';
import {
  BUB,
  CHIP,
  COL_CX,
  EXPAND_AT,
  FIN,
  FIN_SCALE0,
  IND,
  K,
  LABEL,
  LAYOUT,
  SPR,
  T,
  TL,
  Timed,
  W,
  finLh,
  screenY,
  sp,
} from './timeline';

const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------- highlighted text ----------
type Seg = {t: string; hl: boolean};
export const parseLine = (s: string): Seg[] =>
  s
    .split('*')
    .map((t, k) => ({t, hl: k % 2 === 1}))
    .filter((x) => x.t.length > 0);

/** progress of the orange underline sweep for highlight #j of a message */
export const hlProgress = (f: number, pop: number, j: number) =>
  interpolate(f, [pop + T.hlDelay + j * T.hlDur * 0.85, pop + T.hlDelay + j * T.hlDur * 0.85 + T.hlDur], [0, 1], {
    ...CL,
    easing: Easing.inOut(Easing.cubic),
  });

export const Lines: React.FC<{
  lines: string[];
  f: number;
  pop: number;
  lh: number;
  ulH: number;
  ulOff: number;
  hlWeight: number;
}> = ({lines, f, pop, lh, ulH, ulOff, hlWeight}) => {
  let j = 0;
  return (
    <>
      {lines.map((line, li) => (
        <div key={li} style={{height: lh, lineHeight: `${lh}px`, whiteSpace: 'nowrap'}}>
          {parseLine(line).map((seg, si) => {
            if (!seg.hl) return <span key={si}>{seg.t}</span>;
            const p = hlProgress(f, pop, j++);
            return (
              <span
                key={si}
                style={{
                  fontWeight: hlWeight,
                  paddingBottom: ulOff,
                  backgroundImage: `linear-gradient(${C.orange}, ${C.orange})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundPosition: '0 100%',
                  backgroundSize: `${p * 100}% ${ulH}px`,
                }}
              >
                {seg.t}
              </span>
            );
          })}
        </div>
      ))}
    </>
  );
};

// ---------- small pieces ----------
const Ticks: React.FC<{seen: number}> = ({seen}) => {
  const col = seen > 0.5 ? C.orangeDeep : K.tick;
  return (
    <svg width={40} height={24} viewBox="0 0 40 24" style={{marginLeft: 10, verticalAlign: -3}}>
      <path d="M2 13 L9 20 L22 5" fill="none" stroke={col} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17 18 L19 20 L32 5" fill="none" stroke={col} strokeWidth={3.4} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

const Meta: React.FC<{m: Timed; f: number; dark: boolean}> = ({m, f, dark}) => (
  <div
    style={{
      height: BUB.metaH,
      lineHeight: `${BUB.metaH}px`,
      textAlign: 'right',
      fontFamily: FONT.body,
      fontSize: 28,
      fontWeight: 500,
      color: dark ? C.sage : C.text2,
      opacity: dark ? 0.85 : 0.7,
      fontVariantNumeric: 'tabular-nums',
      whiteSpace: 'nowrap',
    }}
  >
    {m.time}
    {m.who === 'veli' ? <Ticks seen={m.seenAt !== undefined && f >= m.seenAt ? 1 : 0} /> : null}
  </div>
);

const radius = (who: 'veli' | 'hasat') =>
  who === 'hasat'
    ? `${BUB.radius}px ${BUB.radius}px ${BUB.radius}px ${BUB.tail}px`
    : `${BUB.radius}px ${BUB.radius}px ${BUB.tail}px ${BUB.radius}px`;

/** pop-in transform for a bubble (scale from its tail corner) */
const popStyle = (f: number, at: number, who: 'veli' | 'hasat'): React.CSSProperties => {
  const s = sp(f - at, SPR.pop);
  const o = interpolate(f, [at, at + 5], [0, 1], CL);
  return {
    transform: `translateY(${(1 - s) * 24}px) scale(${0.45 + 0.55 * s})`,
    transformOrigin: who === 'hasat' ? '0% 100%' : '100% 100%',
    opacity: o,
  };
};

// ---------- final statement text (shared by the bubble and the full-screen card) ----------
export const FinalText: React.FC<{m: Timed; f: number}> = ({m, f}) => (
  <div
    style={{
      fontFamily: FONT.heading,
      fontWeight: 650,
      fontSize: FIN.cardFont,
      letterSpacing: -2,
      color: C.cream,
      whiteSpace: 'nowrap',
    }}
  >
    <Lines lines={m.lines} f={f} pop={m.pop} lh={FIN.cardFont * FIN.lhRatio} ulH={14} ulOff={10} hlWeight={650} />
  </div>
);
export const FIN_BUBBLE_W = 486;

// ---------- bubble ----------
export const Bubble: React.FC<{m: Timed; f: number}> = ({m, f}) => {
  const top = screenY(m.y, f);
  const dark = m.who === 'hasat';
  const base: React.CSSProperties = {
    position: 'absolute',
    top,
    height: m.h,
    boxSizing: 'border-box',
    padding: `${BUB.padT}px ${BUB.padX}px ${BUB.padB}px`,
    borderRadius: radius(m.who),
    background: dark ? C.green : K.bubbleVeli,
    color: dark ? C.cream : C.green,
    boxShadow: dark
      ? '0 10px 28px rgba(11,32,28,0.20)'
      : '0 2px 0 rgba(18,49,43,0.05), 0 10px 26px rgba(18,49,43,0.08)',
    ...(dark ? {left: LAYOUT.colL} : {right: W - LAYOUT.colR}),
    ...popStyle(f, m.pop, m.who),
  };
  if (m.final) {
    return (
      <div style={{...base, width: FIN_BUBBLE_W}}>
        <div style={{height: m.lines.length * finLh + 6, position: 'relative'}}>
          <div style={{position: 'absolute', left: 0, top: 6, transform: `scale(${FIN_SCALE0})`, transformOrigin: '0 0'}}>
            <FinalText m={m} f={f} />
          </div>
        </div>
        <Meta m={m} f={f} dark />
      </div>
    );
  }
  return (
    <div style={{...base, maxWidth: LAYOUT.bubbleMaxW}}>
      <div style={{fontFamily: FONT.body, fontSize: BUB.font, fontWeight: 450, letterSpacing: -0.3}}>
        <Lines lines={m.lines} f={f} pop={m.pop} lh={BUB.lh} ulH={6} ulOff={4} hlWeight={650} />
      </div>
      <Meta m={m} f={f} dark={dark} />
    </div>
  );
};

// ---------- typing indicator ----------
export const TypingIndicator: React.FC<{m: Timed; f: number}> = ({m, f}) => {
  const start = m.indStart!;
  if (f < start || f > m.pop + 6) return null;
  const s = sp(f - start, SPR.pop);
  const out = interpolate(f, [m.pop - 1, m.pop + 5], [1, 0], CL);
  const t = f - start;
  return (
    <div
      style={{
        position: 'absolute',
        left: LAYOUT.colL,
        top: screenY(m.y, f) + (m.h > IND.h ? 0 : 0),
        width: IND.w,
        height: IND.h,
        borderRadius: radius('hasat'),
        background: C.green,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 16,
        transform: `scale(${(0.4 + 0.6 * s) * (0.9 + 0.1 * out)})`,
        transformOrigin: '0% 100%',
        opacity: interpolate(f, [start, start + 4], [0, 1], CL) * out,
        boxShadow: '0 10px 28px rgba(11,32,28,0.18)',
      }}
    >
      {[0, 1, 2].map((k) => {
        const ph = (((t / 22 - k * 0.16) % 1) + 1) % 1;
        const b = ph < 0.55 ? Math.sin((ph / 0.55) * Math.PI) : 0;
        return (
          <div
            key={k}
            style={{
              width: 20,
              height: 20,
              borderRadius: 10,
              background: C.cream,
              opacity: 0.45 + 0.55 * b,
              transform: `translateY(${-11 * b}px)`,
            }}
          />
        );
      })}
    </div>
  );
};

// ---------- topic chip ----------
export const TopicChip: React.FC<{f: number}> = ({f}) => {
  const s = sp(f - T.chipAt, SPR.pop);
  const o = interpolate(f, [T.chipAt, T.chipAt + 5], [0, 1], CL);
  const top = screenY(CHIP.y, f);
  if (top < -200) return null;
  return (
    <div
      style={{
        position: 'absolute',
        top,
        left: COL_CX,
        height: CHIP.h,
        transform: `translateX(-50%) scale(${0.7 + 0.3 * s})`,
        transformOrigin: '50% 50%',
        opacity: o,
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '0 40px 0 26px',
        borderRadius: CHIP.h / 2,
        background: 'rgba(255,255,255,0.78)',
        border: `2px solid ${C.line2}`,
        boxSizing: 'border-box',
        whiteSpace: 'nowrap',
        fontFamily: FONT.body,
        fontWeight: 600,
        fontSize: 46,
        color: C.green,
        letterSpacing: -0.3,
      }}
    >
      <Basak size={58} progress={interpolate(f, [T.chipAt + 2, T.chipAt + 26], [0, 1], CL)} />
      {LABEL}
    </div>
  );
};

// ---------- the whole list ----------
export const ChatList: React.FC<{f: number}> = ({f}) => (
  <>
    <TopicChip f={f} />
    {TL.map((m) => {
      const ind = m.indStart !== undefined ? <TypingIndicator key={`i${m.i}`} m={m} f={f} /> : null;
      const visible = f >= m.pop && !(m.final && f >= EXPAND_AT);
      const top = screenY(m.y, f);
      if (top + m.h < -50) return null;
      return (
        <React.Fragment key={m.i}>
          {ind}
          {visible ? <Bubble m={m} f={f} /> : null}
        </React.Fragment>
      );
    })}
  </>
);
