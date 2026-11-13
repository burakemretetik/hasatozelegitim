import React from 'react';
import {Basak, C, FONT, HasatLogo} from '../../shared/brand';
import {clamp01, Pose} from './anim';
import {CARD_H, CARD_T, CARD_W} from './timeline';
import {Check} from './icons';

const DEG = Math.PI / 180;
const R = 34; // card corner radius
const EDGE = '#D3DCD6';

const hidden: React.CSSProperties = {backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden'};

/* ------------------------------------------------------------------ faces */

export const CardFace: React.FC<{
  icon: React.ReactNode;
  label: string;
  tint: string;
  labelSize?: number;
  accent?: boolean;
}> = ({icon, label, tint, labelSize = 44, accent}) => (
  <>
    <div
      style={{
        position: 'absolute',
        left: 16,
        right: 16,
        top: 16,
        height: 238,
        borderRadius: 24,
        background: tint,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: 'inset 0 -6px 14px rgba(18,49,43,0.05), inset 0 1px 0 rgba(255,255,255,0.7)',
      }}
    >
      <div style={{transform: 'scale(0.98)'}}>{icon}</div>
    </div>
    <div
      style={{
        position: 'absolute',
        left: 0,
        right: 0,
        top: 254,
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: FONT.geometric,
        fontWeight: 600,
        fontSize: labelSize,
        letterSpacing: '-0.01em',
        color: accent ? C.orangeDeep : C.green,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </div>
  </>
);

export const DoneBack: React.FC = () => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      borderRadius: R,
      background: 'linear-gradient(155deg, #275A4E 0%, #173D35 55%, #12312B 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.12)',
    }}
  >
    <Check size={150} />
  </div>
);

export const BrandBack: React.FC<{warm?: boolean}> = ({warm}) => (
  <div
    style={{
      position: 'absolute',
      inset: 0,
      borderRadius: R,
      background: warm
        ? 'linear-gradient(155deg, #F2BC62 0%, #E8A33D 60%, #D18B2A 100%)'
        : 'linear-gradient(155deg, #275A4E 0%, #173D35 55%, #12312B 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    }}
  >
    <div
      style={{
        position: 'absolute',
        inset: 14,
        borderRadius: R - 10,
        border: `2.5px solid ${warm ? 'rgba(18,49,43,0.25)' : 'rgba(232,163,61,0.35)'}`,
      }}
    />
    <Basak size={170} stem={warm ? C.green : C.cream} grain={warm ? C.green : C.orange} />
  </div>
);

export const LogoFace: React.FC = () => (
  <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
    <HasatLogo vertical width={190} />
  </div>
);

/* ------------------------------------------------------------------ card */

const shadowEl = (blur: number, dx: number, dy: number, op: number, sx: number, sy: number, rz: number, z: number): React.ReactNode =>
  op <= 0.002 ? null : (
    <div
      style={{
        position: 'absolute',
        inset: 0,
        borderRadius: R,
        background: '#0B201C',
        opacity: op,
        filter: `blur(${blur.toFixed(1)}px)`,
        transform: `translate3d(${dx.toFixed(1)}px, ${dy.toFixed(1)}px, ${z}px) rotateZ(${rz}deg) scale(${sx.toFixed(3)}, ${sy.toFixed(3)})`,
      }}
    />
  );

/**
 * A soft 3D picture card: real thickness (stacked edge layers), front/back faces,
 * layered soft shadows that react to lift, light shading + specular sheen that react to rotation.
 */
export const Card3D: React.FC<{
  p: Pose;
  face: React.ReactNode;
  back?: React.ReactNode;
  opacity?: number;
  faceBg?: string;
  ring?: number; // 0..1 orange highlight ring
}> = ({p, face, back, opacity = 1, faceBg, ring = 0}) => {
  const o = clamp01(p.o * opacity);
  if (o <= 0.003) return null;
  const totalRy = p.ry + p.flip * 180;
  const cy = Math.cos(totalRy * DEG);
  const cx = Math.cos(p.rx * DEG);
  const lift = Math.max(0, p.lift);
  const sh = p.sh * o;
  // shading from rotation (light from upper-left)
  const turn = Math.sin(totalRy * DEG);
  const tilt = Math.sin(p.rx * DEG);
  const shadeFront = clamp01(Math.max(0, turn) * 0.35 + Math.max(0, -tilt) * 0.25);
  const sheenPos = 18 + (p.ry * 1.6 - p.rx * 1.2 + p.rz * 0.8 + p.flip * 120) ;
  const layers = [1, 2, 3, 4];
  return (
    <div
      style={{
        position: 'absolute',
        left: p.x - CARD_W / 2,
        top: p.y - CARD_H / 2,
        width: CARD_W,
        height: CARD_H,
        transformStyle: 'preserve-3d',
        transform: `translate3d(0px, 0px, ${p.z.toFixed(2)}px) scale(${p.s.toFixed(4)})`,
      }}
    >
      {/* ambient + contact shadow */}
      {shadowEl(12 + lift * 0.32, lift * 0.12, 10 + lift * 0.42, 0.2 * sh * (1 - clamp01(lift / 700)), Math.abs(cy) * 0.97, Math.abs(cx) * 0.97, p.rz, 0.4)}
      {shadowEl(3 + lift * 0.2, 0, 3 + lift * 0.18, 0.32 * sh * (1 - clamp01(lift / 45)), Math.abs(cy) * 0.99, Math.abs(cx) * 0.99, p.rz, 0.6)}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          transformStyle: 'preserve-3d',
          transform: `translateZ(${(lift + CARD_T + 0.8).toFixed(2)}px) rotateZ(${p.rz.toFixed(2)}deg) rotateX(${p.rx.toFixed(2)}deg) rotateY(${totalRy.toFixed(2)}deg)`,
        }}
      >
        {layers.map((i) => (
          <div
            key={i}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: R,
              background: i === 4 ? '#C3CEC7' : EDGE,
              opacity: o,
              transform: `translateZ(${(-(i * CARD_T) / 5).toFixed(2)}px)`,
            }}
          />
        ))}
        {/* front */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: R,
            overflow: 'hidden',
            background: faceBg ?? 'linear-gradient(165deg, #FFFFFF 0%, #FBFCFA 55%, #F1F4F1 100%)',
            boxShadow: `inset 0 2px 0 rgba(255,255,255,1), inset 0 0 0 1.5px rgba(18,49,43,0.06)${ring > 0 ? `, 0 0 0 ${(6 * ring).toFixed(1)}px rgba(232,163,61,${(0.95 * ring).toFixed(2)})` : ''}`,
            opacity: o,
            ...hidden,
          }}
        >
          {face}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: `linear-gradient(118deg, rgba(255,255,255,0) ${sheenPos - 22}%, rgba(255,255,255,0.42) ${sheenPos}%, rgba(255,255,255,0) ${sheenPos + 22}%)`,
            }}
          />
          <div style={{position: 'absolute', inset: 0, background: '#0B201C', opacity: shadeFront}} />
        </div>
        {/* back */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: R,
            overflow: 'hidden',
            opacity: o,
            transform: `translateZ(${-CARD_T}px) rotateY(180deg)`,
            background: '#173D35',
            ...hidden,
          }}
        >
          {back ?? <DoneBack />}
          <div
            style={{
              position: 'absolute',
              inset: 0,
              background: '#0B201C',
              opacity: clamp01(Math.max(0, -turn) * 0.3),
            }}
          />
        </div>
      </div>
    </div>
  );
};

/* ------------------------------------------------------------------ felt board */

export const FELT_NOISE = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='1.1' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 0.22 0'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>")`;

/** Felt/Velcro board slab with thickness and a stitched edge. Children are drawn on its face (flat). */
export const Board: React.FC<{
  p: Pose;
  w: number;
  h: number;
  opacity?: number;
  children?: React.ReactNode;
}> = ({p, w, h, opacity = 1, children}) => {
  const o = clamp01(p.o * opacity);
  if (o <= 0.003) return null;
  const T = 16;
  const lift = Math.max(0, p.lift);
  return (
    <div
      style={{
        position: 'absolute',
        left: p.x - w / 2,
        top: p.y - h / 2,
        width: w,
        height: h,
        transformStyle: 'preserve-3d',
        transform: `translate3d(0px, 0px, ${p.z.toFixed(2)}px) rotateZ(${p.rz}deg) rotateX(${p.rx.toFixed(2)}deg) rotateY(${p.ry.toFixed(2)}deg) scale(${p.s})`,
      }}
    >
      {/* wall shadow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 44,
          background: '#0B201C',
          opacity: 0.2 * o * p.sh,
          filter: `blur(${26 + lift * 0.3}px)`,
          transform: `translate3d(0px, ${26 + lift * 0.4}px, ${-T - 2}px) scale(0.97)`,
        }}
      />
      {[1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: 44,
            background: i >= 4 ? '#0E2823' : '#15382F',
            opacity: o,
            transform: `translateZ(${(-(i * T) / 5).toFixed(2)}px)`,
          }}
        />
      ))}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: 44,
          overflow: 'hidden',
          opacity: o,
          backgroundColor: '#1F4A40',
          backgroundImage: `${FELT_NOISE}, radial-gradient(120% 90% at 25% 0%, rgba(255,255,255,0.13), rgba(255,255,255,0) 60%), linear-gradient(180deg, #24544A 0%, #1B4239 100%)`,
          boxShadow: 'inset 0 2px 0 rgba(255,255,255,0.16), inset 0 -3px 0 rgba(0,0,0,0.18)',
        }}
      >
        <div
          style={{
            position: 'absolute',
            inset: 13,
            borderRadius: 33,
            border: '2.5px dashed rgba(244,246,243,0.26)',
          }}
        />
        {children}
      </div>
    </div>
  );
};

/** Velcro patch + dashed slot outline + small number (drawn on a board face, coordinates relative to board centre). */
export const Slot: React.FC<{
  cx: number;
  cy: number;
  s: number;
  n?: number;
  opacity?: number;
}> = ({cx, cy, s, n, opacity = 1}) => {
  const w = CARD_W * s;
  const h = CARD_H * s;
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - w / 2,
        top: cy - h / 2,
        width: w,
        height: h,
        borderRadius: R * s,
        border: '3px dashed rgba(244,246,243,0.22)',
        boxSizing: 'border-box',
        opacity,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div
        style={{
          width: w * 0.52,
          height: h * 0.5,
          borderRadius: 14,
          backgroundColor: '#2C5E52',
          backgroundImage: 'repeating-linear-gradient(45deg, rgba(255,255,255,0.07) 0 3px, rgba(255,255,255,0) 3px 7px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT.geometric,
          fontWeight: 600,
          fontSize: 44,
          color: 'rgba(244,246,243,0.55)',
        }}
      >
        {n ?? ''}
      </div>
    </div>
  );
};
