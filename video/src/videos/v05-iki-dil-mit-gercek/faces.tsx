import React from 'react';
import {Basak, C, FONT, HasatLogo} from '../../shared/brand';
import {CardText, OUTRO_LINE, Seg, TITLE} from './content';
import {CH, CW} from './Card3D';

const PAD = 64;
export const MYTH_BG = 'linear-gradient(165deg, #CFDAD5 0%, #BFCDC7 55%, #B3C2BC 100%)';
export const FACT_BG = 'linear-gradient(165deg, #FFFFFC 0%, #F6F7F2 50%, #ECEFE9 100%)';
const EDGE_HI = 'inset 0 3px 0 rgba(255,255,255,0.55), inset 0 -3px 0 rgba(0,0,0,0.07), inset 0 0 0 1.5px rgba(255,255,255,0.25)';

const Paper: React.FC<{bg: string; children: React.ReactNode}> = ({bg, children}) => (
  <div style={{position: 'absolute', inset: 0, background: bg, boxShadow: EDGE_HI}}>
    {/* soft top-left light on the paper */}
    <div
      style={{
        position: 'absolute',
        inset: 0,
        background: 'radial-gradient(90% 60% at 20% 0%, rgba(255,255,255,0.35), rgba(255,255,255,0) 70%)',
      }}
    />
    {children}
  </div>
);

const XIcon: React.FC<{size: number; color: string}> = ({size, color}) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="17" fill="none" stroke={color} strokeWidth="3.4" />
    <path d="M13.5 13.5 L26.5 26.5 M26.5 13.5 L13.5 26.5" stroke={color} strokeWidth="3.6" strokeLinecap="round" />
  </svg>
);

const CheckIcon: React.FC<{size: number}> = ({size}) => (
  <svg width={size} height={size} viewBox="0 0 40 40">
    <circle cx="20" cy="20" r="18" fill={C.greenDeep} />
    <path d="M11.5 20.5 L17.5 26.5 L29 14" fill="none" stroke={C.orange} strokeWidth="4.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const tagText: React.CSSProperties = {fontFamily: FONT.body, fontWeight: 800, fontSize: 38, letterSpacing: '0.09em', lineHeight: 1};

export const MythTag: React.FC = () => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 14,
      padding: '13px 26px 13px 14px',
      borderRadius: 999,
      border: `3px solid rgba(62,86,80,0.55)`,
      background: 'rgba(62,86,80,0.07)',
      color: C.text2,
      ...tagText,
    }}
  >
    <XIcon size={42} color={C.text2} />
    <span style={{paddingTop: 2}}>YANLIŞ BİLİNEN</span>
  </div>
);

/** Orange "DOĞRU" stamp. p: 0..1+ land spring. */
export const FactTag: React.FC<{p: number; ring: number}> = ({p, ring}) => {
  const k = Math.max(0, p);
  const scale = 1 + (1 - Math.min(k, 1.2)) * 0.9;
  const op = Math.min(1, k * 3.5);
  return (
    <div style={{position: 'relative', display: 'inline-block', transform: `rotate(${-4 - (1 - Math.min(k, 1)) * 9}deg) scale(${scale})`, transformOrigin: '30% 50%', opacity: op}}>
      {/* ink ring that spreads once on impact */}
      {ring > 0 && ring < 1 ? (
        <div
          style={{
            position: 'absolute',
            inset: -6 - ring * 26,
            borderRadius: 22 + ring * 20,
            border: `3px solid rgba(232,163,61,${0.55 * (1 - ring)})`,
          }}
        />
      ) : null}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 14,
          padding: '12px 30px 12px 14px',
          borderRadius: 16,
          background: `linear-gradient(170deg, #EFB04E, ${C.orange} 60%, #DE962F)`,
          color: C.greenDeep,
          boxShadow: `inset 0 0 0 4px rgba(11,32,28,0.0), inset 0 0 0 6px rgba(255,240,210,0.35), 0 4px 10px rgba(168,104,26,0.25)`,
          ...tagText,
          fontSize: 42,
        }}
      >
        <CheckIcon size={46} />
        <span style={{paddingTop: 3}}>DOĞRU</span>
      </div>
    </div>
  );
};

const Footer: React.FC<{muted?: boolean}> = ({muted}) => (
  <div style={{position: 'absolute', left: PAD, right: PAD, bottom: 46, height: 64, display: 'flex', alignItems: 'center', gap: 22}}>
    <div style={{flex: 1, height: 3, borderRadius: 2, background: muted ? 'rgba(62,86,80,0.22)' : 'rgba(18,49,43,0.12)'}} />
    <Basak size={64} stem={muted ? 'rgba(62,86,80,0.55)' : C.green} grain={muted ? 'rgba(62,86,80,0.45)' : C.orange} />
  </div>
);

/** Myth side. strike[i]: 0..1 draw progress of the line through row i. */
export const MythFace: React.FC<{card: CardText; strike: number[]}> = ({card, strike}) => (
  <Paper bg={MYTH_BG}>
    <div
      style={{
        position: 'absolute',
        right: 56,
        top: -70,
        fontFamily: FONT.serifDisplay,
        fontSize: 420,
        lineHeight: 1,
        color: 'rgba(62,86,80,0.13)',
      }}
    >
      “
    </div>
    <div style={{position: 'absolute', left: PAD, top: PAD}}>
      <MythTag />
    </div>
    <div
      style={{
        position: 'absolute',
        left: PAD,
        right: PAD,
        top: 190,
        bottom: 150,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        fontFamily: FONT.heading,
        fontWeight: 650,
        fontSize: 100,
        lineHeight: 1.06,
        letterSpacing: '-0.015em',
        color: C.text2,
      }}
    >
      {card.myth.map((l, i) => {
        const p = strike[i] ?? 0;
        return (
          <div key={i} style={{whiteSpace: 'nowrap'}}>
            <span style={{position: 'relative', display: 'inline-block'}}>
              {l}
              {p > 0 ? (
                <span
                  style={{
                    position: 'absolute',
                    left: -14,
                    top: '53%',
                    height: 11,
                    width: `calc(${p} * (100% + 28px))`,
                    borderRadius: 6,
                    background: C.orangeDeep,
                    transform: `translateY(-50%) rotate(${i % 2 === 0 ? -1.6 : 1.1}deg)`,
                    transformOrigin: '0 50%',
                    boxShadow: '0 1px 0 rgba(255,255,255,0.25)',
                  }}
                />
              ) : null}
            </span>
          </div>
        );
      })}
    </div>
    <Footer muted />
  </Paper>
);

/** Renders lines of segments; `hl` segments get an orange marker sweep (progress shared in order). */
const HighlightLines: React.FC<{lines: Seg[][]; hl: number; markerColor: string; style: React.CSSProperties}> = ({lines, hl, markerColor, style}) => {
  const total = lines.flat().filter((s) => s.hl).reduce((n, s) => n + s.t.length, 0);
  let before = 0;
  return (
    <div style={style}>
      {lines.map((line, i) => (
        <div key={i} style={{whiteSpace: 'pre'}}>
          {line.map((seg, j) => {
            if (!seg.hl) return <span key={j}>{seg.t}</span>;
            const a = before / total;
            const b = (before + seg.t.length) / total;
            before += seg.t.length;
            const lp = Math.max(0, Math.min(1, (hl - a) / (b - a)));
            return (
              <span
                key={j}
                style={{
                  backgroundImage: `linear-gradient(${markerColor}, ${markerColor})`,
                  backgroundRepeat: 'no-repeat',
                  backgroundSize: `${(lp * 100).toFixed(2)}% 0.42em`,
                  backgroundPosition: '0 88%',
                  borderRadius: 4,
                }}
              >
                {seg.t}
              </span>
            );
          })}
        </div>
      ))}
    </div>
  );
};

export const FactFace: React.FC<{card: CardText; stamp: number; ring: number; hl: number}> = ({card, stamp, ring, hl}) => (
  <Paper bg={FACT_BG}>
    <div style={{position: 'absolute', left: PAD, top: PAD - 4}}>
      <FactTag p={stamp} ring={ring} />
    </div>
    <div style={{position: 'absolute', left: PAD, right: PAD, top: 190, bottom: 150, display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
      <HighlightLines
        lines={card.fact}
        hl={hl}
        markerColor="rgba(232,163,61,0.42)"
        style={{fontFamily: FONT.heading, fontWeight: 600, fontSize: card.factSize, lineHeight: 1.2, letterSpacing: '-0.01em', color: C.green}}
      />
    </div>
    <Footer />
  </Paper>
);

/** Orange title cover. */
export const CoverFace: React.FC = () => (
  <Paper bg={`linear-gradient(165deg, #F2B858 0%, ${C.orange} 50%, #DA912E 100%)`}>
    <div style={{position: 'absolute', inset: 26, borderRadius: 30, border: '2.5px solid rgba(11,32,28,0.22)'}} />
    <div style={{position: 'absolute', left: PAD + 6, right: PAD, top: 96, fontFamily: FONT.heading, color: C.greenDeep}}>
      <div style={{fontSize: 70, fontWeight: 600, lineHeight: 1.1, letterSpacing: '-0.01em'}}>{TITLE.top}</div>
      <div style={{fontSize: 560, fontWeight: 800, lineHeight: 0.86, letterSpacing: '-0.04em', marginTop: 40, marginLeft: -18}}>{TITLE.num}</div>
      <div style={{fontSize: 106, fontWeight: 700, lineHeight: 1, letterSpacing: '-0.02em', marginTop: 34}}>{TITLE.bottom}</div>
    </div>
    <div style={{position: 'absolute', right: 64, bottom: 58}}>
      <Basak size={92} stem={C.greenDeep} grain="#FFF6E6" />
    </div>
  </Paper>
);

/** Brand outro card. */
export const BrandFace: React.FC = () => (
  <Paper bg={FACT_BG}>
    <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 64}}>
      <HasatLogo vertical width={460} />
      <div style={{fontFamily: FONT.body, fontWeight: 500, fontSize: 52, color: C.text2, letterSpacing: '-0.005em'}}>{OUTRO_LINE}</div>
    </div>
    <div style={{position: 'absolute', left: (CW - 120) / 2, bottom: 70, width: 120, height: 5, borderRadius: 3, background: C.orange}} />
  </Paper>
);

export const CARD_SIZE = {w: CW, h: CH};
