/** HTML layer that lives in map space: title, station labels, info panels, spur card, terminal sign, legend. */
import React from 'react';
import {interpolate, spring} from 'remotion';
import {C, FONT} from '../../shared/brand';
import * as T from './timeline';
import {Cam, camCss, DE_BLUE, GHOST, LINE, ST, TINT} from './map';

const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const F = FONT.geometric;
const sp = (f: number, start: number, dur = 14) =>
  spring({frame: f - start, fps: 30, config: {damping: 200}, durationInFrames: dur});

const BAL = {textWrap: 'balance'} as React.CSSProperties;
const name = (size: number, color: string = C.green): React.CSSProperties => ({
  fontFamily: F,
  fontWeight: 650,
  fontSize: size,
  lineHeight: 1.04,
  color,
  letterSpacing: '-0.012em',
  whiteSpace: 'nowrap',
});
const body = (size = 50, color: string = C.green): React.CSSProperties => ({
  fontFamily: F,
  fontWeight: 500,
  fontSize: size,
  lineHeight: 1.22,
  color,
  ...BAL,
});
const kick = (color: string): React.CSSProperties => ({fontFamily: F, fontWeight: 650, fontSize: 46, lineHeight: 1.2, color});
const sub: React.CSSProperties = {fontFamily: F, fontWeight: 500, fontSize: 50, lineHeight: 1.16, color: C.text2, whiteSpace: 'nowrap'};

/** Labels dim once their station is passed and come back for the final overview. */
const labelDim = (f: number, depart: number) => {
  const d = interpolate(f, [depart + T.OUT + 4, depart + T.OUT + 16], [1, 0.2], CL);
  const o = interpolate(f, [T.D9 + 8, T.OV], [0, 1], CL);
  return d + (0.95 - d) * o;
};

/** Station label: wipes out of the station (left → right). */
const Label: React.FC<{x: number; y: number; f: number; arrive: number; depart: number; lead?: number; children: React.ReactNode}> = ({
  x,
  y,
  f,
  arrive,
  depart,
  lead = T.IN + 14,
  children,
}) => {
  const s = sp(f, arrive - lead, 14);
  if (s <= 0.001) return null;
  return (
    <div
      style={{
        position: 'absolute',
        left: x,
        top: y,
        opacity: labelDim(f, depart) * Math.min(1, s * 1.6),
        clipPath: `inset(-40px ${(1 - s) * 100}% -40px -40px)`,
        transform: `translateX(${(1 - s) * -30}px)`,
      }}
    >
      {children}
    </div>
  );
};

/** Info callout: unfolds downward from the label; accent bar in the line colour. */
const Panel: React.FC<{
  f: number;
  start: number;
  hideAt: number;
  accent: string;
  bg?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({f, start, hideAt, accent, bg = '#FFFFFF', children, style}) => {
  const s = sp(f, start, 14);
  const h = interpolate(f, [hideAt, hideAt + 10], [1, 0], CL);
  if (s <= 0.001 || h <= 0) return null;
  return (
    <div
      style={{
        position: 'relative',
        background: bg,
        border: `3px solid ${C.line2}`,
        borderRadius: 26,
        padding: '26px 34px 30px 46px',
        opacity: h * Math.min(1, s * 1.5),
        transform: `translateY(${(1 - s) * -22}px)`,
        clipPath: `inset(-12px -12px ${(1 - s) * 100}% -12px)`,
        ...style,
      }}
    >
      <div style={{position: 'absolute', left: -3, top: -3, bottom: -3, width: 16, background: accent, borderRadius: '26px 0 0 26px'}} />
      {children}
    </div>
  );
};

const InfoIcon: React.FC<{color: string}> = ({color}) => (
  <svg width={60} height={60} viewBox="0 0 60 60" style={{flex: '0 0 auto', marginTop: 2}}>
    <circle cx={30} cy={30} r={28} fill={color} />
    <circle cx={30} cy={17} r={5} fill="#FFFFFF" />
    <rect x={25} y={26} width={10} height={22} rx={5} fill="#FFFFFF" />
  </svg>
);

const Note: React.FC<{f: number; start: number; hideAt: number; line: 'TR' | 'DE'; children: React.ReactNode}> = ({f, start, hideAt, line, children}) => (
  <Panel f={f} start={start} hideAt={hideAt} accent={LINE[line]} bg={TINT[line]} style={{borderColor: line === 'TR' ? GHOST.TR : GHOST.DE}}>
    <div style={{display: 'flex', gap: 22, alignItems: 'flex-start'}}>
      <InfoIcon color={line === 'TR' ? C.orangeDeep : DE_BLUE} />
      <div style={body(50)}>{children}</div>
    </div>
  </Panel>
);

export const BadgeHtml: React.FC<{line: 'G' | 'TR' | 'DE'; size?: number}> = ({line, size = 64}) => (
  <div
    style={{
      width: size,
      height: size,
      borderRadius: size / 2,
      background: LINE[line],
      border: `${Math.round(size * 0.07)}px solid ${C.cream}`,
      boxSizing: 'border-box',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: F,
      fontWeight: 700,
      fontSize: line === 'G' ? size * 0.52 : size * 0.4,
      letterSpacing: '-0.02em',
      color: line === 'TR' ? C.greenDeep : '#FFFFFF',
      flex: '0 0 auto',
    }}
  >
    {line}
  </div>
);

const Title: React.FC<{f: number}> = ({f}) => {
  const lines = ['Bir şeylerin farklı', 'olduğunu mu', 'düşünüyorsunuz?'];
  const subS = sp(f, T.SUB_START, 14);
  return (
    <div style={{position: 'absolute', left: 80, top: 300, width: 860}}>
      <div style={{display: 'flex', gap: 12, marginBottom: 34}}>
        {[LINE.G, LINE.TR, LINE.DE].map((c, i) => (
          <div
            key={c}
            style={{
              width: 92,
              height: 18,
              borderRadius: 9,
              background: c,
              transformOrigin: '0 50%',
              transform: `scaleX(${sp(f, -12 + i * 4, 16)})`,
            }}
          />
        ))}
      </div>
      {lines.map((l, i) => {
        const s = sp(f, -14 + i * 3, 16);
        return (
          <div key={l} style={{overflow: 'hidden', paddingBottom: 14, marginBottom: -14}}>
            <div
              style={{
                fontFamily: F,
                fontWeight: 700,
                fontSize: 104,
                lineHeight: 1.02,
                letterSpacing: '-0.02em',
                color: C.green,
                whiteSpace: 'nowrap',
                transform: `translateY(${(1 - s) * 105}%)`,
              }}
            >
              {l}
            </div>
          </div>
        );
      })}
      <div
        style={{
          marginTop: 30,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          opacity: subS,
          transform: `translateY(${(1 - subS) * 24}px)`,
        }}
      >
        <div style={{width: 46, height: 10, borderRadius: 5, background: C.orange}} />
        <div style={{fontFamily: F, fontWeight: 500, fontSize: 60, color: C.text2, whiteSpace: 'nowrap'}}>İşte atabileceğiniz adımlar.</div>
      </div>
    </div>
  );
};

const Legend: React.FC<{f: number}> = ({f}) => {
  const s = sp(f, T.OV - 34, 22);
  if (s <= 0.001) return null;
  const row: React.CSSProperties = {display: 'flex', alignItems: 'center', gap: 30, fontFamily: F, fontWeight: 600, fontSize: 64, color: C.green, whiteSpace: 'nowrap'};
  return (
    <div
      style={{
        position: 'absolute',
        left: 1230,
        top: 300,
        padding: '48px 60px',
        background: '#FFFFFF',
        border: `4px solid ${C.line2}`,
        borderRadius: 40,
        display: 'flex',
        flexDirection: 'column',
        gap: 30,
        opacity: s,
      }}
    >
      <div style={row}>
        <BadgeHtml line="G" size={96} />
        Gözlem hattı
      </div>
      <div style={row}>
        <BadgeHtml line="TR" size={96} />
        Türkiye hattı
      </div>
      <div style={row}>
        <BadgeHtml line="DE" size={96} />
        Almanya hattı
      </div>
      <div style={row}>
        <svg width={96} height={96} viewBox="0 0 96 96">
          <line x1={10} y1={48} x2={86} y2={48} stroke={LINE.X} strokeWidth={20} strokeDasharray="22 16" strokeLinecap="round" />
        </svg>
        Diğer ülkeler
      </div>
    </div>
  );
};

export const WorldLabels: React.FC<{f: number; cam: Cam}> = ({f, cam}) => {
  const lx = (pt: {x: number}) => pt.x + 64;
  const q = ['Ne zaman?', 'Hangi durumda?', 'Ne sıklıkla?'];
  // spur card + terminal sign
  const spurS = sp(f, T.A8 - 8, 14);
  const spurH = interpolate(f, [T.D8 + T.OUT, T.D8 + T.OUT + 10], [1, 0], CL);
  const termS = sp(f, T.A9 - 2, 16);
  const termH = interpolate(f, [T.D9 + T.OUT, T.D9 + T.OUT + 10], [1, 0], CL);

  return (
    <div style={{position: 'absolute', left: 0, top: 0, width: 1, height: 1, transformOrigin: '0 0', transform: camCss(cam)}}>
      <Title f={f} />
      <Legend f={f} />

      {/* ---- Gözlem hattı ---- */}
      <Label x={lx(ST.S1)} y={ST.S1.y - 48} f={f} arrive={T.A1} depart={T.D1}>
        <div style={name(88)}>Not alın</div>
      </Label>
      <div style={{position: 'absolute', left: lx(ST.S1), top: ST.S1.y + 84}}>
        <Panel f={f} start={T.A1 - 6} hideAt={T.D1 + T.OUT} accent={LINE.G}>
          <div style={{position: 'relative', display: 'flex', flexDirection: 'column', gap: 16, paddingRight: 30}}>
            <div style={{position: 'absolute', left: 13, top: 34, bottom: 34, width: 8, borderRadius: 4, background: C.green}} />
            {q.map((t, i) => {
              const s = sp(f, T.A1 - 2 + i * 5, 12);
              return (
                <div key={t} style={{display: 'flex', alignItems: 'center', gap: 26, opacity: s, transform: `translateX(${(1 - s) * -20}px)`}}>
                  <div style={{width: 34, height: 34, borderRadius: 17, background: '#FFFFFF', border: `8px solid ${C.green}`, boxSizing: 'border-box', zIndex: 1}} />
                  <div style={{...body(54), whiteSpace: 'nowrap', fontWeight: 550}}>{t}</div>
                </div>
              );
            })}
          </div>
        </Panel>
      </div>

      <Label x={lx(ST.S2)} y={ST.S2.y - 40} f={f} arrive={T.A2} depart={T.D2}>
        <div style={name(72)}>Kısa videolar çekin</div>
      </Label>

      <Label x={ST.X.x + 120} y={ST.X.y - 44} f={f} arrive={T.A3} depart={T.D3} lead={12}>
        <div style={name(80)}>Çocuğunuzun</div>
        <div style={name(80)}>doktoruyla</div>
        <div style={name(80)}>paylaşın</div>
      </Label>

      {/* ---- Türkiye hattı ---- */}
      <Label x={lx(ST.TR1)} y={ST.TR1.y - 48} f={f} arrive={T.A4} depart={T.D4}>
        <div style={name(88)}>Aile hekimi</div>
      </Label>
      <div style={{position: 'absolute', left: lx(ST.TR1), top: ST.TR1.y + 76, width: 680, display: 'flex', flexDirection: 'column', gap: 24}}>
        <Panel f={f} start={T.A4 - 4} hideAt={T.D4 + T.OUT} accent={LINE.TR}>
          <div style={{...body(60, C.orangeDeep), fontWeight: 700, marginBottom: 6}}>18–36 aylık çocuklar,</div>
          <div style={body(50)}>Sağlık Bakanlığı programı kapsamında otizm açısından taranıyor.</div>
        </Panel>
        <Note f={f} start={T.N4_START} hideAt={T.D4 + T.OUT} line="TR">
          Endişeniz varsa tarama zamanını beklemeden söyleyin.
        </Note>
      </div>

      <Label x={lx(ST.TR2)} y={ST.TR2.y - 28} f={f} arrive={T.A5} depart={T.D5}>
        <div style={kick(C.orangeDeep)}>Gerekirse:</div>
        <div style={name(70)}>çocuk ve ergen</div>
        <div style={name(70)}>ruh sağlığı uzmanı</div>
      </Label>

      {/* ---- Almanya hattı ---- */}
      <Label x={lx(ST.DE1)} y={ST.DE1.y - 48} f={f} arrive={T.A6} depart={T.D6}>
        <div style={name(88)}>Kinderarzt</div>
        <div style={{...sub, marginTop: 6}}>(çocuk doktoru)</div>
      </Label>
      <div style={{position: 'absolute', left: lx(ST.DE1), top: ST.DE1.y + 140, width: 680}}>
        <Panel f={f} start={T.A6 - 4} hideAt={T.D6 + T.OUT} accent={LINE.DE}>
          <div style={body(54)}>
            Düzenli <span style={{whiteSpace: 'nowrap'}}>U-muayeneleri</span> iyi bir fırsat.
          </div>
        </Panel>
      </div>

      <Label x={lx(ST.DE2)} y={ST.DE2.y - 28} f={f} arrive={T.A7} depart={T.D7}>
        <div style={kick(DE_BLUE)}>Gerekirse:</div>
        <div style={{...name(76), fontWeight: 700}}>SPZ</div>
        <div style={sub}>(sosyal pediatri merkezi)</div>
        <div style={{...sub, fontSize: 46, margin: '6px 0 2px'}}>ya da</div>
        <div style={name(70)}>çocuk ve ergen</div>
        <div style={name(70)}>psikiyatrisi</div>
      </Label>
      <div style={{position: 'absolute', left: lx(ST.DE2), top: ST.DE2.y + 410, width: 680}}>
        <Note f={f} start={T.N7_START} hideAt={T.D7 + T.OUT} line="DE">
          Bekleme süreleri uzun olabilir: Randevuyu erken alın.
        </Note>
      </div>

      {/* ---- Diğer ülkeler (spur) ---- */}
      {spurS > 0.001 && spurH > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: ST.SPUR.x - 340,
            top: ST.SPUR.y + 64,
            width: 680,
            boxSizing: 'border-box',
            padding: '30px 40px 34px',
            background: '#FFFFFF',
            border: `5px dashed ${LINE.X}`,
            borderRadius: 30,
            textAlign: 'center',
            opacity: spurH * Math.min(1, spurS * 1.5),
            transform: `translateY(${(1 - spurS) * -24}px)`,
            clipPath: `inset(-12px -12px ${(1 - spurS) * 100}% -12px)`,
          }}
        >
          <div style={{...name(62, C.text2), fontWeight: 700, marginBottom: 12}}>Diğer ülkeler</div>
          <div style={body(52)}>İlk adres yine çocuğunuzun doktoru.</div>
        </div>
      ) : null}

      {/* ---- Terminal ---- */}
      {termS > 0.001 && termH > 0 ? (
        <div
          style={{
            position: 'absolute',
            left: ST.TERM.x - 410,
            top: ST.TERM.y + 128,
            width: 820,
            boxSizing: 'border-box',
            padding: '34px 48px 44px',
            background: C.green,
            borderRadius: 34,
            opacity: termH * Math.min(1, termS * 1.5),
            transform: `translateY(${(1 - termS) * 30}px) scale(${0.94 + 0.06 * termS})`,
            transformOrigin: '50% 0%',
          }}
        >
          <div style={{display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 26}}>
            <div style={{width: 120, height: 14, borderRadius: 7, background: LINE.TR}} />
            <div style={{width: 120, height: 14, borderRadius: 7, background: '#7FA0BF'}} />
          </div>
          <div style={{fontFamily: F, fontWeight: 600, fontSize: 66, lineHeight: 1.14, color: C.cream, textAlign: 'center', letterSpacing: '-0.01em', ...BAL}}>
            Tanıyı yalnızca bu alanda yetkin bir hekim koyabilir.
          </div>
        </div>
      ) : null}
    </div>
  );
};
