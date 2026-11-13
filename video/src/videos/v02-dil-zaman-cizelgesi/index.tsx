import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {Basak, C, FONT, HasatLogo, SafeZoneDebug} from '../../shared/brand';
import {EASE, clamp01, kf, lerp, prog} from './anim';
import {
  IconAlert,
  IconBubble1,
  IconBubble2,
  IconC,
  IconEar,
  IconHand,
  IconRepeat,
  IconWave,
} from './icons';
import {ANCHOR, AX, COL, COL_R, HEAD_X, HER_F, Ms, RULER, S_OVER, S_ZOOM, T} from './timing';

const DEBUG = false;

export const meta = {
  id: 'v02',
  durationInFrames: T.total,
  coverFrame: 100,
};

const WHITE = '#FFFFFF';

// ---------------------------------------------------------------- camera
type Cam = {ox: number; oy: number; angle: number; S: number; F: number; M: number; Lm: number; sp: number};

const getCam = (f: number): Cam => {
  const [m12, m16, m24] = T.ms;
  const her = T.her;
  const S = kf(f, [
    [0, RULER.S],
    [T.swing[0], RULER.S],
    [T.swing[1], S_OVER],
    [m12.ts, S_OVER],
    [m12.te, S_ZOOM],
    [her.ts, S_ZOOM],
    [her.te, S_OVER],
  ]);
  const travel: Array<[number, number]> = [
    [0, 0],
    [m12.ts, 0],
    [m12.te, 12],
    [m16.ts, 12],
    [m16.te, 16],
    [m24.ts, 16],
    [m24.te, 24],
  ];
  const F = kf(f, [...travel, [her.ts, 24], [her.te, HER_F], [T.close.cam0, HER_F], [T.close.cam1, 0]]);
  const M = kf(f, [...travel, [T.close.cam0, 24], [T.close.cam1, 0]]);
  const sp = prog(f, T.swing[0], T.swing[1] - T.swing[0], EASE.inOut);
  const Lm = kf(f, [
    [0, 1.5],
    [44, 29.5, EASE.out],
    [T.swing[1] - 8, 29.5],
    [T.swing[1] + 16, 90, EASE.out],
  ]);
  return {
    ox: lerp(RULER.x, AX, sp),
    oy: lerp(RULER.y, ANCHOR - F * S, sp),
    angle: lerp(-90, 0, sp),
    S,
    F,
    M,
    Lm,
    sp,
  };
};

const range = (a: number, b: number) => {
  const r: number[] = [];
  for (let i = a; i <= b; i++) r.push(i);
  return r;
};

// ---------------------------------------------------------------- text helpers
type Seg = {t: string; em: boolean};
const parse = (s: string): Seg[] =>
  s
    .split('*')
    .map((t, i) => ({t, em: i % 2 === 1}))
    .filter((x) => x.t.length > 0);

/** one masked line that rises into place; *words* get emphasis (weight and/or highlighter band) */
const Line: React.FC<{
  text: string;
  p: number;
  hp?: number;
  size: number;
  lh: number;
  font: string;
  weight: number;
  color: string;
  emWeight?: number;
  emColor?: string;
  band?: boolean;
}> = ({text, p, hp = 0, size, lh, font, weight, color, emWeight, emColor, band = true}) => (
  <div style={{height: lh, overflow: 'hidden', position: 'relative', isolation: 'isolate'}}>
    <div
      style={{
        transform: `translateY(${(1 - p) * 104}%)`,
        opacity: clamp01(p * 2),
        whiteSpace: 'nowrap',
        fontFamily: font,
        fontSize: size,
        lineHeight: `${lh}px`,
        fontWeight: weight,
        color,
      }}
    >
      {parse(text).map((s, i) =>
        s.em ? (
          <span key={i} style={{position: 'relative', fontWeight: emWeight ?? weight, color: emColor ?? color}}>
            {band ? (
              <span
                style={{
                  position: 'absolute',
                  left: '-0.06em',
                  right: '-0.06em',
                  bottom: '0.16em',
                  height: '0.36em',
                  background: C.orange,
                  opacity: 0.55,
                  zIndex: -1,
                  transform: `scaleX(${hp})`,
                  transformOrigin: 'left center',
                  borderRadius: 3,
                }}
              />
            ) : null}
            {s.t}
          </span>
        ) : (
          <span key={i}>{s.t}</span>
        ),
      )}
    </div>
  </div>
);

// ---------------------------------------------------------------- axis + graphics (one SVG)
const NODES = [12, 16, 24];

const AxisLayer: React.FC<{f: number; cam: Cam}> = ({f, cam}) => {
  const {ox, oy, angle, S, Lm, sp, M} = cam;
  const her = T.her;
  const fade = 1 - prog(f, T.outro, 14, EASE.in);
  const vertical = sp >= 0.999;
  const m0 = vertical ? Math.max(0, Math.floor(-oy / S) - 1) : 0;
  const m1 = vertical ? Math.min(Math.floor(Lm), Math.ceil((1920 - oy) / S) + 1) : Math.floor(Lm);
  const months = range(m0, Math.max(m0, m1));
  const rad = (angle * Math.PI) / 180;
  const cs = Math.abs(Math.cos(rad));
  const sn = Math.abs(Math.sin(rad));
  const fine = clamp01((S - 60) / 40);
  const labelAll = clamp01((S - 75) / 30);
  const gridOp = clamp01((sp - 0.75) / 0.25) * fade;
  const bold = 1 - sp;

  // band "her yaşta"
  const bp = prog(f, her.ts + 8, 30, EASE.inOut) * fade;
  const uM = 24 * S;
  const bandTop = lerp(uM, 0, bp);
  const bandBot = lerp(uM, 1920 - oy + 80, bp);

  // marker
  const bump = T.ms.reduce((acc, ms) => {
    const t = (f - ms.ts) / (ms.te - ms.ts);
    return t > 0 && t < 1 ? acc + 20 * Math.sin(Math.PI * t) : acc;
  }, 0);
  const markerOp =
    clamp01(1 - prog(f, her.ts + 8, 16, EASE.in) + prog(f, T.close.cam1 - 10, 16, EASE.out)) * fade;
  const markerScale = prog(f, -8, 16, EASE.out);
  const breath = 0.5 + 0.5 * Math.sin(f * 0.09);

  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
      {/* baseline grid */}
      {gridOp > 0 &&
        months.map((m) => {
          const major = m % 6 === 0;
          const op = (major ? 1 : fine * 0.7) * gridOp;
          if (op <= 0.01) return null;
          const y = oy + m * S;
          return <line key={'g' + m} x1={AX} x2={1080} y1={y} y2={y} stroke={major ? C.line2 : C.line} strokeWidth={2} opacity={op} />;
        })}

      <g transform={`translate(${ox} ${oy}) rotate(${angle})`}>
        {/* band */}
        {bp > 0.001 && (
          <rect x={-12} width={24} y={bandTop} height={Math.max(0, bandBot - bandTop)} rx={12} fill={C.orange} opacity={0.32} />
        )}
        {/* axis line */}
        {f < T.outro && <line x1={0} y1={0} x2={0} y2={Lm * S} stroke={C.green} strokeWidth={3 + 2 * bold} strokeLinecap="round" />}
        <g opacity={fade}>
          <line x1={-16 * (1 + 0.6 * bold)} x2={16 * (1 + 0.6 * bold)} y1={0} y2={0} stroke={C.green} strokeWidth={3 + 2 * bold} strokeLinecap="round" />
          {/* ticks */}
          {months.map((m) => {
            const a = clamp01((Lm - m) * 1.5);
            if (a <= 0) return null;
            const u = m * S;
            const major = m % 6 === 0;
            const len = (major ? 26 : 14) * a * (1 + 0.6 * bold);
            const quarters =
              fine > 0.01
                ? [0.25, 0.5, 0.75].map((q) => (
                    <line key={q} x1={-7} x2={0} y1={(m + q) * S} y2={(m + q) * S} stroke={C.green} strokeWidth={1.5} opacity={fine * 0.45} />
                  ))
                : null;
            const lop = major ? 1 : labelAll;
            const fs = 30 + 10 * bold;
            const w = String(m).length * 0.6 * fs;
            const dist = 26 * (1 + 0.6 * bold) + 14 + (w / 2) * cs + fs * 0.45 * sn;
            return (
              <g key={m}>
                <line x1={-len} x2={0} y1={u} y2={u} stroke={C.green} strokeWidth={(major ? 3 : 2) * (1 + 0.4 * bold)} opacity={major ? 0.9 : 0.55} />
                {quarters}
                {lop > 0.01 && (
                  <g transform={`translate(${-dist} ${u}) rotate(${-angle})`} opacity={lop * a}>
                    <text
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontFamily={FONT.grotesk}
                      fontWeight={major ? 600 : 500}
                      fontSize={fs}
                      fill={major ? C.text2 : C.text2}
                      opacity={major ? 1 : 0.75}
                    >
                      {m}
                    </text>
                  </g>
                )}
              </g>
            );
          })}
          {/* milestone nodes */}
          {NODES.map((m, i) => {
            const pop = prog(f, T.b2.full + i * 8, 18, EASE.out);
            if (pop <= 0) return null;
            const ms = T.ms[i];
            const visited = prog(f, ms.te - 6, 10, EASE.out);
            return (
              <g key={m} transform={`translate(0 ${m * S}) scale(${0.4 + 0.6 * pop})`} opacity={pop}>
                <circle r={12} fill={C.cream} stroke={C.orange} strokeWidth={4} />
                <circle r={12 * visited} fill={C.orange} />
              </g>
            );
          })}
          {/* you-are-here marker */}
          {markerOp > 0.001 && (
            <g transform={`translate(0 ${M * S + bump}) scale(${markerScale * (1 + 0.2 * bold)})`} opacity={markerOp}>
              <circle r={30 + 4 * breath} fill={C.orange} opacity={0.16 + 0.06 * breath} />
              <circle r={17} fill={C.orange} stroke={C.cream} strokeWidth={5} />
            </g>
          )}
        </g>
      </g>

      {/* reading lines from the marker to each card */}
      {[...T.ms, T.her].map((ms, i) => {
        const lin = prog(f, ms.te - 12, 16, EASE.out);
        const lout = prog(f, ms.out, 12, EASE.in);
        const x2 = AX + (COL_R - AX) * lin * (1 - lout);
        if (x2 < AX + 2) return null;
        return <line key={i} x1={AX} x2={x2} y1={ANCHOR} y2={ANCHOR} stroke={C.orange} strokeWidth={4} strokeLinecap="round" />;
      })}
    </svg>
  );
};

// ---------------------------------------------------------------- overview rows (B2 and closing recap)
const ROWS: Array<{m: number; icons: IconC[]}> = [
  {m: 12, icons: [IconWave, IconHand]},
  {m: 16, icons: [IconBubble1]},
  {m: 24, icons: [IconBubble2]},
];

const Rows: React.FC<{f: number; cam: Cam}> = ({f, cam}) => {
  if (cam.sp < 1) return null;
  return (
    <>
      {ROWS.map((r, i) => {
        const s1 = T.b2.full + i * 8;
        const s2 = T.close.rows + i * 6;
        const a1 = prog(f, s1, 20, EASE.out) * (1 - prog(f, T.ms[0].ts - 4, 12, EASE.in));
        const a2 = prog(f, s2, 20, EASE.out) * (1 - prog(f, T.outro - 6, 12, EASE.in));
        const a = Math.max(a1, a2);
        if (a <= 0.001) return null;
        const ip = f < T.warn.in ? prog(f, s1 + 4, 28, EASE.inOut) : prog(f, s2 + 4, 28, EASE.inOut);
        const y = cam.oy + r.m * cam.S;
        return (
          <div
            key={r.m}
            style={{
              position: 'absolute',
              left: AX + 22,
              top: y - 44,
              height: 88,
              display: 'flex',
              alignItems: 'center',
              opacity: a,
              transform: `translateX(${(1 - a) * -18}px)`,
            }}
          >
            <div style={{width: COL - AX - 22 - 12, height: 2, background: C.line2}} />
            <div
              style={{
                marginLeft: 12,
                width: 168,
                fontFamily: FONT.grotesk,
                fontWeight: 600,
                fontSize: 52,
                color: C.green,
                fontVariantNumeric: 'tabular-nums',
              }}
            >
              {r.m} ay
            </div>
            <div style={{display: 'flex', gap: 10}}>
              {r.icons.map((Ic, k) => (
                <Ic key={k} p={ip} f={f} size={84} weight={6} />
              ))}
            </div>
          </div>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- odometer counter / "Her yaşta" header
const DIG = 236; // font size = line box
const BASE = 0.844 * DIG; // baseline from top of the line box (Space Grotesk metrics)
const CTOP = ANCHOR - 34 - BASE;

const snap = (v: number) => {
  const i = Math.floor(v);
  return i + EASE.inOut(clamp01((v - i - 0.45) / 0.55));
};

const Counter: React.FC<{f: number; cam: Cam}> = ({f, cam}) => {
  const her = T.her;
  const vis = prog(f, T.ms[0].ts + 2, 12, EASE.out);
  const hp = prog(f, her.ts + 2, 20, EASE.inOut);
  const hp2 = prog(f, her.ts + 8, 20, EASE.out);
  const hout = prog(f, her.out, 10, EASE.in);
  if (vis <= 0 || hout >= 1) return null;
  const v = snap(Math.max(0, cam.M));
  const ones = v % 10;
  const tens = Math.floor(v / 10) + clamp01(ones - 9);
  const colW = 146;
  const digitStyle: React.CSSProperties = {
    height: DIG,
    lineHeight: `${DIG}px`,
    fontFamily: FONT.grotesk,
    fontWeight: 500,
    fontSize: DIG,
    color: C.green,
    textAlign: 'right',
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.02em',
  };
  const strip = (items: string[], pos: number) => (
    <div style={{width: colW, height: DIG, overflow: 'hidden'}}>
      <div style={{transform: `translateY(${-pos * DIG}px)`}}>
        {items.map((d, i) => (
          <div key={i} style={digitStyle}>
            {d}
          </div>
        ))}
      </div>
    </div>
  );
  const mask = 'linear-gradient(to bottom, transparent 0, black 9%, black 95%, transparent 100%)';
  return (
    <div
      style={{
        position: 'absolute',
        left: COL - 14,
        top: CTOP,
        width: COL_R - COL + 14,
        height: DIG,
        overflow: 'hidden',
        WebkitMaskImage: mask,
        maskImage: mask,
        opacity: vis * (1 - hout),
        transform: `translateY(${-hout * 16}px)`,
      }}
    >
      <div style={{position: 'absolute', inset: 0, transform: `translateY(${-hp * DIG}px)`}}>
        <div style={{display: 'flex'}}>
          {strip(['', '1', '2', '3'], tens)}
          {strip(['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0'], ones)}
        </div>
        <div
          style={{
            position: 'absolute',
            left: colW * 2 + 26,
            top: BASE - 0.844 * 66,
            fontFamily: FONT.grotesk,
            fontWeight: 500,
            fontSize: 66,
            lineHeight: '66px',
            color: C.text2,
          }}
        >
          aylıkken
        </div>
      </div>
      <div
        style={{
          position: 'absolute',
          left: 14,
          top: BASE - 0.844 * 132 - 16 + (1 - hp2) * DIG,
          fontFamily: FONT.grotesk,
          fontWeight: 600,
          fontSize: 132,
          lineHeight: '132px',
          color: C.green,
          letterSpacing: '-0.02em',
          whiteSpace: 'nowrap',
        }}
      >
        Her yaşta
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- data cards
type CardDef = {ms: Ms; icons: IconC[]; lines: string[]};
const CARDS: CardDef[] = [
  {ms: T.ms[0], icons: [IconWave, IconHand], lines: ['*Agulamıyorsa;*', 'el sallama, işaret etme', 'gibi *jestleri*', '*kullanmıyorsa*']},
  {ms: T.ms[1], icons: [IconBubble1], lines: ['Hiç *tek kelime*', '*söylemiyorsa*']},
  {ms: T.ms[2], icons: [IconBubble2], lines: ['Taklit olmayan,', '*iki kelimelik* anlamlı', 'ifadeler kurmuyorsa']},
  {
    ms: T.her,
    icons: [IconEar, IconRepeat],
    lines: ['Söyleneni *anlamıyor*', 'gibi görünüyorsa ya da', 'duyduğu sözcükleri', 'yalnızca *tekrar ediyorsa*'],
  },
];

const CARD_H = 600;
const CARD_PAD = 34;
const FOOT_W = COL_R - COL - CARD_PAD * 2;

/** footer of every card: a mini map of the age axis with the current stop */
const MiniAxis: React.FC<{f: number; ms: Ms; idx: number}> = ({f, ms, idx}) => {
  const lp = prog(f, ms.te - 2, 26, EASE.out);
  const np = prog(f, ms.te + 6, 16, EASE.out);
  const X = (m: number) => 12 + (m / 30) * (FOOT_W - 24);
  const isHer = idx === 3;
  return (
    <svg width={FOOT_W} height={40} style={{position: 'absolute', left: CARD_PAD, bottom: 34, overflow: 'visible'}}>
      <line x1={X(0)} x2={X(0) + (X(30) - X(0)) * lp} y1={20} y2={20} stroke={C.line2} strokeWidth={3} strokeLinecap="round" />
      {[0, 6, 12, 18, 24, 30].map((m) => (
        <line key={m} x1={X(m)} x2={X(m)} y1={12} y2={28} stroke={C.line2} strokeWidth={2} opacity={clamp01(lp * 30 - m + 1)} />
      ))}
      {isHer && <rect x={X(0) - 8} y={12} width={(X(30) - X(0) + 16) * np} height={16} rx={8} fill={C.orange} opacity={0.42} />}
      {[12, 16, 24].map((m, i) => {
        const cur = i === idx;
        const past = i < idx || isHer;
        const op = clamp01(lp * 30 - m + 1);
        return (
          <g key={m} opacity={op}>
            {cur && <circle cx={X(m)} cy={20} r={22 * np} fill={C.orange} opacity={0.2} />}
            <circle
              cx={X(m)}
              cy={20}
              r={cur ? 8 + 4 * np : 8}
              fill={cur ? C.orange : past ? C.green : WHITE}
              stroke={cur ? C.orange : past ? C.green : C.line2}
              strokeWidth={3}
            />
          </g>
        );
      })}
    </svg>
  );
};

const Card: React.FC<{f: number; c: CardDef; idx: number}> = ({f, c, idx}) => {
  const {ms} = c;
  const u = prog(f, ms.te - 14, 20, EASE.out) * (1 - prog(f, ms.out + 3, 10, EASE.in));
  if (u <= 0.001) return null;
  const co = prog(f, ms.out, 6, EASE.in);
  return (
    <div style={{position: 'absolute', left: COL, top: ANCHOR + 2, width: COL_R - COL, height: CARD_H}}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: WHITE,
          borderRadius: '0 0 22px 22px',
          border: `2px solid ${C.line}`,
          borderTop: 'none',
          boxShadow: '0 36px 70px -34px rgba(18,49,43,0.28)',
          transform: `scaleY(${u})`,
          transformOrigin: 'top',
        }}
      />
      <div style={{position: 'absolute', inset: 0, opacity: 1 - co, transform: `translateY(${-co * 10}px)`}}>
        <div style={{position: 'absolute', left: CARD_PAD, top: 34, display: 'flex', gap: 28, height: 150, alignItems: 'center'}}>
          {c.icons.map((Ic, i) => (
            <Ic key={i} p={prog(f, ms.te - 4 + i * 8, 30, EASE.inOut)} f={f} size={150} />
          ))}
        </div>
        <div style={{position: 'absolute', left: CARD_PAD, top: 34 + 150 + 20}}>
          {c.lines.map((l, i) => (
            <Line
              key={i}
              text={l}
              p={prog(f, ms.textIn + i * 3, 14, EASE.out)}
              hp={prog(f, ms.full + 2 + i * 3, 16, EASE.out)}
              size={56}
              lh={72}
              font={FONT.body}
              weight={500}
              emWeight={700}
              color={C.green}
            />
          ))}
        </div>
        <MiniAxis f={f} ms={ms} idx={idx} />
      </div>
    </div>
  );
};

// ---------------------------------------------------------------- headline beats
const Headline: React.FC<{
  f: number;
  lines: string[];
  start: number;
  out: number;
  top: number;
  size: number;
  lh: number;
  hpStart?: number;
  stagger?: number;
}> = ({f, lines, start, out, top, size, lh, hpStart, stagger = 5}) => {
  const o = prog(f, out, 12, EASE.in);
  if (f < start - 8 || o >= 1) return null;
  return (
    <div style={{position: 'absolute', left: HEAD_X, top, opacity: 1 - o, transform: `translateY(${-o * 24}px)`}}>
      {lines.map((l, i) => (
        <Line
          key={i}
          text={l}
          p={prog(f, start + i * stagger, 18, EASE.out)}
          hp={hpStart === undefined ? 0 : prog(f, hpStart, 18, EASE.out)}
          size={size}
          lh={lh}
          font={FONT.heading}
          weight={650}
          color={C.green}
        />
      ))}
    </div>
  );
};

const Hook: React.FC<{f: number}> = ({f}) => {
  const o = prog(f, T.hook.out, 12, EASE.in);
  if (o >= 1) return null;
  const bar = prog(f, -6, 18, EASE.out);
  return (
    <>
      <div
        style={{
          position: 'absolute',
          left: HEAD_X,
          top: 420,
          width: 96,
          height: 10,
          borderRadius: 4,
          background: C.orange,
          transform: `scaleX(${bar * (1 - o)})`,
          transformOrigin: 'left',
        }}
      />
      <Headline
        f={f}
        lines={['Konuşma', 'gecikmesi', '*tek başına*', 'otizm anlamına', 'gelmez.']}
        start={-6}
        stagger={3}
        out={T.hook.out}
        top={468}
        size={112}
        lh={118}
        hpStart={22}
      />
    </>
  );
};

// ---------------------------------------------------------------- warning block (interrupts the timeline)
const WTOP = 458;
const WH = 824;

const WarningBlock: React.FC<{f: number}> = ({f}) => {
  const {in: wi, out: wo} = T.warn;
  const pin = prog(f, wi, 30, EASE.out);
  const pout = prog(f, wo, 24, EASE.in);
  if (pin <= 0 || pout >= 1) return null;
  const x = (1 - pin) * 1100 - pout * 1100;
  const chip = prog(f, wi + 14, 16, EASE.out);
  const brk = prog(f, wi + 22, 12, EASE.out) * (1 - prog(f, wo, 8, EASE.in));
  const breakMark = (y: number) => (
    <g opacity={brk}>
      <line x1={AX - 22} x2={AX + 22} y1={y + 3} y2={y - 11} stroke={C.cream} strokeWidth={12} />
      <line x1={AX - 20} x2={AX + 20} y1={y + 9} y2={y - 5} stroke={C.green} strokeWidth={3} strokeLinecap="round" />
      <line x1={AX - 20} x2={AX + 20} y1={y - 3} y2={y - 17} stroke={C.green} strokeWidth={3} strokeLinecap="round" />
    </g>
  );
  return (
    <>
      <div style={{position: 'absolute', left: 0, top: WTOP, width: 1080, height: WH, background: C.green, transform: `translateX(${x}px)`}}>
        <div style={{position: 'absolute', left: HEAD_X, top: 84}}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 14,
              background: C.orange,
              borderRadius: 12,
              padding: '12px 26px 12px 18px',
              opacity: chip,
              transform: `translateY(${(1 - chip) * 20}px)`,
            }}
          >
            <IconAlert p={prog(f, wi + 18, 24, EASE.inOut)} f={f} size={50} color={C.green} weight={8} />
            <span style={{fontFamily: FONT.grotesk, fontWeight: 600, fontSize: 46, lineHeight: '52px', color: C.green, whiteSpace: 'nowrap'}}>
              Her yaşta geçerli bir uyarı
            </span>
          </div>
          <div style={{marginTop: 52}}>
            {['Daha önce kazandığı', 'kelimeleri ya da sosyal', 'becerileri kaybediyorsa', '*beklemeyin.*'].map((l, i) => (
              <Line
                key={i}
                text={l}
                p={prog(f, wi + 18 + i * 4, 16, EASE.out)}
                size={60}
                lh={78}
                font={FONT.body}
                weight={500}
                emWeight={750}
                color={C.cream}
                band={false}
              />
            ))}
          </div>
          <div style={{marginTop: 44}}>
            {['En kısa sürede', 'doktorunuza başvurun.'].map((l, i) => (
              <Line key={i} text={l} p={prog(f, wi + 26 + i * 4, 16, EASE.out)} size={72} lh={84} font={FONT.heading} weight={650} color={C.orange} />
            ))}
          </div>
        </div>
      </div>
      <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
        {breakMark(WTOP - 22)}
        {breakMark(WTOP + WH + 30)}
      </svg>
    </>
  );
};

// ---------------------------------------------------------------- outro: the axis becomes the wheat stem
const Outro: React.FC<{f: number}> = ({f}) => {
  const t0 = T.outro;
  if (f < t0) return null;
  const W = 440;
  const k = W / 250.7;
  const Lx = 540 - W / 2;
  const Ly = 560;
  const bs = 128 * k;
  const bx = Lx + 61.35 * k;
  const by = Ly + 30.4 * k;
  const stemTop = by + (13.5 * bs) / 40;
  const stemBot = by + (38.5 * bs) / 40;
  const mp = prog(f, t0 + 4, 18, EASE.inOut);
  const gp = prog(f, t0 + 20, 22, EASE.linear);
  const lo = prog(f, t0 + 24, 14, EASE.out);
  const tg = prog(f, t0 + 26, 14, EASE.out);
  return (
    <>
      {mp < 1 ? (
        <svg width={1080} height={1920} style={{position: 'absolute', inset: 0}}>
          <line
            x1={lerp(AX, 540, mp)}
            x2={lerp(AX, 540, mp)}
            y1={lerp(ANCHOR, stemTop, mp)}
            y2={lerp(1940, stemBot, mp)}
            stroke={C.green}
            strokeWidth={lerp(3, (1.1 * bs) / 40, mp)}
            strokeLinecap="round"
          />
        </svg>
      ) : (
        <Basak size={bs} progress={0.35 + 0.65 * gp} style={{position: 'absolute', left: bx, top: by}} />
      )}
      <HasatLogo vertical width={W} style={{position: 'absolute', left: Lx, top: Ly, opacity: lo}} />
      <div
        style={{
          position: 'absolute',
          left: 0,
          width: 1080,
          top: Ly + 294 * k + 70,
          textAlign: 'center',
          fontFamily: FONT.body,
          fontWeight: 500,
          fontSize: 50,
          color: C.text2,
          opacity: tg,
          transform: `translateY(${(1 - tg) * 18}px)`,
        }}
      >
        Yazının tamamı blogumuzda.
      </div>
    </>
  );
};

// ---------------------------------------------------------------- composition
export const Video: React.FC = () => {
  const f = useCurrentFrame();
  const cam = getCam(f);
  return (
    <AbsoluteFill style={{background: C.cream, overflow: 'hidden'}}>
      <AxisLayer f={f} cam={cam} />
      <Rows f={f} cam={cam} />
      <Hook f={f} />
      <Headline
        f={f}
        lines={['Ama bu durumlarda', 'bir uzmana danışın:']}
        start={T.b2.in}
        out={T.b2.out}
        top={ANCHOR - 76 - 188}
        size={84}
        lh={94}
      />
      <Counter f={f} cam={cam} />
      {CARDS.map((c, i) => (
        <Card key={i} f={f} c={c} idx={i} />
      ))}
      <WarningBlock f={f} />
      <Headline
        f={f}
        lines={['*Erken* fark etmek,', 'desteğe *erken*', 'başlamak demektir.']}
        start={T.close.in}
        out={T.close.out + 10}
        top={ANCHOR - 70 - 282}
        size={84}
        lh={94}
        hpStart={T.close.full + 2}
      />
      <Outro f={f} />
      {DEBUG && <SafeZoneDebug />}
    </AbsoluteFill>
  );
};
