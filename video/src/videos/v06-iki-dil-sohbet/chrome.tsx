// Device + app chrome: bezel, status bar, chat header, input dock.
import React from 'react';
import {interpolate, Easing} from 'remotion';
import {Basak, C, FONT} from '../../shared/brand';
import {INP, K, LAYOUT, SPR, TL, W, H, clamp01, inputExtra, scrollAt, sp} from './timeline';

const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;

// ---------- status bar ----------
const StatusIcons: React.FC = () => (
  <svg width={150} height={34} viewBox="0 0 150 34">
    {/* signal */}
    {[0, 1, 2, 3].map((k) => (
      <rect key={k} x={k * 11} y={24 - k * 6 - 6} width={7} height={k * 6 + 8} rx={2} fill={C.green} />
    ))}
    {/* wifi */}
    <g transform="translate(70 28)" fill="none" stroke={C.green} strokeWidth={4} strokeLinecap="round">
      <path d="M -14 -14 A 20 20 0 0 1 14 -14" />
      <path d="M -8 -7 A 11 11 0 0 1 8 -7" />
      <circle cx={0} cy={-1} r={1.6} fill={C.green} />
    </g>
    {/* battery */}
    <rect x={100} y={6} width={42} height={22} rx={6} fill="none" stroke={C.green} strokeWidth={2.5} opacity={0.55} />
    <rect x={104} y={10} width={28} height={14} rx={3} fill={C.green} />
    <rect x={144} y={13} width={3.5} height={8} rx={1.5} fill={C.green} opacity={0.55} />
  </svg>
);

export const StatusBar: React.FC<{f: number}> = ({f}) => {
  const latest = [...TL].reverse().find((m) => f >= m.pop);
  const clock = latest ? latest.time : '21:04';
  return (
    <>
      {/* camera island */}
      <div
        style={{
          position: 'absolute',
          left: W / 2 - 112,
          top: LAYOUT.bezel + 22,
          width: 224,
          height: 64,
          borderRadius: 32,
          background: C.greenDeep,
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: 96,
          top: 50,
          fontFamily: FONT.body,
          fontWeight: 600,
          fontSize: 36,
          color: C.green,
          letterSpacing: 0.5,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {clock}
      </div>
      <div style={{position: 'absolute', right: 86, top: 52}}>
        <StatusIcons />
      </div>
    </>
  );
};

// ---------- header ----------
export const Avatar: React.FC<{size: number; ring?: string; progress?: number}> = ({size, ring, progress = 1}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      background: C.green,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: ring ? `0 0 0 ${Math.round(size * 0.025)}px ${ring}` : undefined,
    }}
  >
    <Basak size={size * 0.78} progress={progress} stem={C.cream} grain={C.orange} style={{marginTop: -size * 0.02}} />
  </div>
);

const typingAmount = (f: number) => {
  let a = 0;
  TL.forEach((m) => {
    if (m.indStart === undefined) return;
    a = Math.max(
      a,
      interpolate(f, [m.indStart, m.indStart + 6, m.pop - 2, m.pop + 4], [0, 1, 1, 0], CL),
    );
  });
  return a;
};

export const Header: React.FC<{f: number}> = ({f}) => {
  const typing = typingAmount(f);
  const shadow = clamp01(scrollAt(f) / 40);
  const cy = 292; // centre line of the header row
  return (
    <div
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        width: W,
        height: LAYOUT.headerBottom,
        background: C.cream,
        borderBottom: `2px solid ${C.line}`,
        boxShadow: `0 10px 30px rgba(18,49,43,${0.08 * shadow})`,
      }}
    >
      <StatusBar f={f} />
      {/* back chevron (decorative) */}
      <svg width={30} height={52} viewBox="0 0 30 52" style={{position: 'absolute', left: 30, top: cy - 26}}>
        <path d="M24 4 L6 26 L24 48" fill="none" stroke={C.green} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <div style={{position: 'absolute', left: LAYOUT.colL, top: cy - 54}}>
        <Avatar size={108} />
      </div>
      <div style={{position: 'absolute', left: LAYOUT.colL + 108 + 28, top: cy - 58}}>
        <div style={{fontFamily: FONT.heading, fontWeight: 650, fontSize: 50, color: C.green, lineHeight: 1.1, letterSpacing: -0.5}}>
          Hasat Özel Eğitim
        </div>
        <div style={{position: 'relative', height: 44, marginTop: 6, fontFamily: FONT.body, fontSize: 32, fontWeight: 500}}>
          <span style={{position: 'absolute', left: 0, top: 0, color: C.text2, opacity: 1 - typing}}>çevrimiçi</span>
          <span style={{position: 'absolute', left: 0, top: 0, color: C.orangeDeep, opacity: typing}}>yazıyor…</span>
        </div>
      </div>
      {/* overflow menu (decorative) */}
      <svg width={12} height={52} viewBox="0 0 12 52" style={{position: 'absolute', right: 40, top: cy - 26}}>
        {[8, 26, 44].map((y) => (
          <circle key={y} cx={6} cy={y} r={5} fill={C.green} />
        ))}
      </svg>
    </div>
  );
};

// ---------- input dock ----------
const SendIcon: React.FC<{color: string}> = ({color}) => (
  <svg width={52} height={52} viewBox="0 0 24 24">
    <path d="M3.4 20.4 21 12 3.4 3.6 3.4 10.2 15 12 3.4 13.8Z" fill={color} />
  </svg>
);

export const InputDock: React.FC<{f: number}> = ({f}) => {
  const extra = inputExtra(f);
  const h = LAYOUT.inputBaseH + extra;
  const fieldR = LAYOUT.colR - LAYOUT.sendSize - 18;
  const top = LAYOUT.inputBottom - h;

  // which parent message is being typed?
  const cur = TL.find((m) => m.who === 'veli' && f >= m.typeStart! - 1 && f < m.pop + 4);
  let content: React.ReactNode = (
    <div style={{color: C.text2, opacity: 0.55, fontWeight: 400}}>Mesaj yazın…</div>
  );
  let active = 0;
  let press = 0;
  if (cur) {
    const lines = cur.input ?? cur.lines;
    const typed = cur.charTimes!.filter((t) => t <= f).length;
    const fade = interpolate(f, [cur.pop, cur.pop + 3], [1, 0], CL);
    active = interpolate(f, [cur.charTimes![0], cur.charTimes![0] + 4, cur.pop, cur.pop + 8], [0, 1, 1, 0], CL);
    press = interpolate(f, [cur.pop - 4, cur.pop - 1, cur.pop + 10], [0, 1, 0], {
      ...CL,
      easing: Easing.inOut(Easing.quad),
    });
    if (typed === 0 && f < cur.pop) {
      content = <div style={{color: C.text2, opacity: 0.55, fontWeight: 400}}>Mesaj yazın…</div>;
    } else if (f < cur.pop + 3) {
      const shown = lines
        .map((l, k) => ({l, k, n: Math.max(0, Math.min(l.length, typed - cur.lineOffsets![k]))}))
        .filter((x) => typed > cur.lineOffsets![x.k]);
      const typingNow = f < cur.typeEnd! + 2;
      content = (
        <div style={{opacity: fade}}>
          {shown.map((x, idx) => (
            <div key={x.k} style={{height: INP.lh, whiteSpace: 'nowrap'}}>
              {x.l.slice(0, x.n)}
              {idx === shown.length - 1 ? (
                <span
                  style={{
                    display: 'inline-block',
                    width: 4,
                    height: 50,
                    marginLeft: 3,
                    verticalAlign: -9,
                    borderRadius: 2,
                    background: C.orange,
                    opacity: typingNow ? 1 : 0,
                  }}
                />
              ) : null}
            </div>
          ))}
        </div>
      );
    } else {
      content = null;
    }
  }
  const btnBg = active > 0.5 ? C.orange : C.green;

  return (
    <>
      {/* dock background */}
      <div
        style={{
          position: 'absolute',
          left: 0,
          top: top - 22,
          width: W,
          height: H - (top - 22),
          background: C.cream,
          borderTop: `2px solid ${C.line}`,
        }}
      />
      {/* text field */}
      <div
        style={{
          position: 'absolute',
          left: LAYOUT.colL,
          top,
          width: fieldR - LAYOUT.colL,
          height: h,
          borderRadius: 56,
          background: '#FFFFFF',
          border: `2px solid ${C.line2}`,
          boxSizing: 'border-box',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: `0 ${INP.padX}px ${INP.padT - 2}px`,
          fontFamily: FONT.body,
          fontSize: INP.font,
          lineHeight: `${INP.lh}px`,
          color: C.green,
          fontWeight: 450,
        }}
      >
        {content}
      </div>
      {/* send button */}
      <div
        style={{
          position: 'absolute',
          left: LAYOUT.colR - LAYOUT.sendSize,
          top: LAYOUT.inputBottom - (LAYOUT.inputBaseH + LAYOUT.sendSize) / 2,
          width: LAYOUT.sendSize,
          height: LAYOUT.sendSize,
          borderRadius: LAYOUT.sendSize / 2,
          background: btnBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `scale(${1 - 0.14 * press})`,
          boxShadow: '0 6px 16px rgba(18,49,43,0.16)',
        }}
      >
        <div style={{marginLeft: 6}}>
          <SendIcon color={active > 0.5 ? C.green : C.cream} />
        </div>
      </div>
      <Keyboard f={f} />
    </>
  );
};

// ---------- on-screen keyboard (Turkish Q layout, decorative; lives in the bottom UI zone) ----------
type KeyDef = {k: string; w: number; label?: React.ReactNode; fn?: boolean};
const KB = {top: 1530, keyH: 74, gap: 14, left: LAYOUT.bezel + 12, right: W - LAYOUT.bezel - 12};
const unit = (KB.right - KB.left - 11 * 10) / 12; // key width for a 12-key row (10px gaps)

const ShiftIcon = () => (
  <svg width={34} height={34} viewBox="0 0 24 24">
    <path d="M12 3 3 12.5h5V20h8v-7.5h5Z" fill="none" stroke={C.green} strokeWidth={2} strokeLinejoin="round" />
  </svg>
);
const BackIcon = () => (
  <svg width={40} height={34} viewBox="0 0 28 24">
    <path d="M9 4h15a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H9l-7-8Z" fill="none" stroke={C.green} strokeWidth={2} strokeLinejoin="round" />
    <path d="m13 9 6 6m0-6-6 6" stroke={C.green} strokeWidth={2} strokeLinecap="round" />
  </svg>
);
const ReturnIcon = () => (
  <svg width={40} height={34} viewBox="0 0 28 24">
    <path d="M23 5v7H6m4-5-5 5 5 5" fill="none" stroke={C.green} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ROWS: KeyDef[][] = [
  'qwertyuıopğü'.split('').map((k) => ({k, w: unit})),
  'asdfghjklşi'.split('').map((k) => ({k, w: unit})),
  [
    {k: 'shift', w: unit * 1.45, label: <ShiftIcon />, fn: true},
    ...'zxcvbnmöç'.split('').map((k) => ({k, w: unit})),
    {k: 'back', w: unit * 1.45, label: <BackIcon />, fn: true},
  ],
  [
    {k: '123', w: unit * 2.1, label: '123', fn: true},
    {k: ' ', w: 0, label: ''},
    {k: 'ret', w: unit * 2.1, label: <ReturnIcon />, fn: true},
  ],
];

/** intensity 0..1 of a key press glow at frame f (most recent press of that key, fading out) */
const pressOf = (f: number) => {
  const cur = TL.find((m) => m.who === 'veli' && f >= m.typeStart! && f < m.pop + 8);
  const glow: Record<string, number> = {};
  if (!cur) return glow;
  const text = (cur.input ?? cur.lines).join(' ');
  cur.charTimes!.forEach((t, idx) => {
    if (t > f) return;
    const ch = text[idx];
    const lower = ch.toLocaleLowerCase('tr');
    const key = ch === ' ' ? ' ' : lower;
    const v = 1 - (f - t) / 5;
    if (v > 0) {
      glow[key] = Math.max(glow[key] ?? 0, v);
      if (ch !== lower) glow.shift = Math.max(glow.shift ?? 0, v);
    }
  });
  // the "send" moment
  const sendV = interpolate(f, [cur.pop - 3, cur.pop, cur.pop + 6], [0, 1, 0], CL);
  if (sendV > 0) glow.ret = Math.max(glow.ret ?? 0, sendV * 0.6);
  return glow;
};

const Keyboard: React.FC<{f: number}> = ({f}) => {
  const glow = pressOf(f);
  return (
    <div style={{position: 'absolute', left: 0, top: KB.top - 18, width: W, height: H - KB.top + 18, background: '#E6EDE9'}}>
      {ROWS.map((row, ri) => {
        const fixed = row.reduce((a, k) => a + k.w, 0) + (row.length - 1) * 10;
        const full = KB.right - KB.left;
        const spaceW = full - fixed;
        const rowW = row.some((k) => k.k === ' ') ? full : fixed;
        let x = KB.left + (full - rowW) / 2;
        return row.map((key) => {
          const w = key.k === ' ' ? spaceW : key.w;
          const kx = x;
          x += w + 10;
          const g = glow[key.k] ?? 0;
          return (
            <div
              key={`${ri}-${key.k}`}
              style={{
                position: 'absolute',
                left: kx,
                top: 18 + ri * (KB.keyH + KB.gap),
                width: w,
                height: KB.keyH,
                borderRadius: 14,
                background: key.fn ? '#CBD8D1' : '#FFFFFF',
                boxShadow: `0 3px 0 rgba(18,49,43,0.13), inset 0 0 0 999px rgba(185,201,195,${0.9 * g})`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: FONT.body,
                fontSize: key.fn ? 32 : 40,
                fontWeight: 450,
                color: C.green,
                transform: `translateY(${g * 2}px)`,
              }}
            >
              {key.label ?? key.k}
            </div>
          );
        });
      })}
    </div>
  );
};

// ---------- device frame ----------
export const Device: React.FC<{children: React.ReactNode}> = ({children}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      background: C.greenDeep,
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: LAYOUT.bezel,
        borderRadius: LAYOUT.screenR,
        overflow: 'hidden',
        background: `linear-gradient(180deg, ${K.chatTop} 0%, ${K.chatBottom} 100%)`,
      }}
    >
      {/* children use full-frame coordinates */}
      <div style={{position: 'absolute', left: -LAYOUT.bezel, top: -LAYOUT.bezel, width: W, height: H}}>{children}</div>
    </div>
  </div>
);

export {sp, SPR};
