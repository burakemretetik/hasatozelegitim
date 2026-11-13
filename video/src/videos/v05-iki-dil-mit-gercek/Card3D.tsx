import React from 'react';
import {Pose, clamp01} from './anim';

export const CW = 820;
export const CH = 980;
export const CR = 46;
const THICK = 12;
const LAYERS = 10;

const faceBase: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  borderRadius: CR,
  overflow: 'hidden',
  backfaceVisibility: 'hidden',
  WebkitBackfaceVisibility: 'hidden',
  boxShadow: '0 2px 4px rgba(3,12,10,0.28)',
};

/** Shading + moving specular sheen applied on top of a face while it turns. */
const Shade: React.FC<{turn: number; dark: number; sheen: number}> = ({turn, dark, sheen}) => (
  <>
    <div style={{position: 'absolute', inset: 0, background: `rgba(6,20,17,${0.34 * turn + dark})`}} />
    {turn > 0.01 ? (
      <div
        style={{
          position: 'absolute',
          inset: 0,
          opacity: Math.min(1, turn * 1.6),
          background: `linear-gradient(100deg, rgba(255,255,255,0) ${sheen - 22}%, rgba(255,255,255,0.28) ${sheen}%, rgba(255,255,255,0) ${sheen + 22}%)`,
        }}
      />
    ) : null}
  </>
);

/**
 * A tactile card with two faces and real thickness. 2D placement (x, y, scale, rotate) happens in
 * a flattened wrapper; the 3D flip happens inside its own perspective so cards never intersect.
 * `press` (0..1) is a tiny squash used when a stamp lands.
 */
export const Card3D: React.FC<{
  pose: Pose;
  z: number;
  front: React.ReactNode;
  back?: React.ReactNode;
  edge?: string;
  press?: number;
}> = ({pose, z, front, back, edge = '#D7DFDA', press = 0}) => {
  if (pose.op <= 0.001 || pose.x < -760 || pose.y > 2500) return null;
  const a = pose.ay;
  const flipP = clamp01(a / 180);
  const lift = 150 * Math.sin(Math.PI * flipP);
  const rx = -5 * Math.sin(Math.PI * flipP);
  const turn = Math.abs(Math.sin((a * Math.PI) / 180));
  const sheen = -20 + flipP * 140;
  const s = pose.s * (1 - 0.014 * press);
  const shY = (20 + lift * 0.32) * s;
  const shB = (30 + lift * 0.42) * s;
  const shA = 0.5 - lift * 0.0009;
  const filter = `${pose.blur > 0.05 ? `blur(${pose.blur.toFixed(2)}px) ` : ''}drop-shadow(0px ${shY.toFixed(1)}px ${shB.toFixed(1)}px rgba(3,12,10,${shA.toFixed(3)}))`;
  const layers = [];
  for (let i = 0; i < LAYERS; i++) {
    const zz = -THICK / 2 + ((i + 0.5) * THICK) / LAYERS;
    layers.push(
      <div
        key={i}
        style={{position: 'absolute', inset: 0, borderRadius: CR, background: edge, transform: `translateZ(${zz}px)`}}
      />,
    );
  }
  return (
    <div style={{position: 'absolute', inset: 0, zIndex: z, opacity: pose.op, filter}}>
      <div
        style={{
          position: 'absolute',
          left: pose.x - CW / 2,
          top: pose.y - CH / 2,
          width: CW,
          height: CH,
          transform: `rotate(${pose.r}deg) scale(${s})`,
        }}
      >
        <div style={{position: 'absolute', inset: 0, perspective: 2600}}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              transformStyle: 'preserve-3d',
              transform: `translateZ(${lift.toFixed(2)}px) rotateX(${rx.toFixed(3)}deg) rotateY(${a.toFixed(3)}deg)`,
            }}
          >
            {turn > 0.004 ? layers : null}
            <div style={{...faceBase, transform: `translateZ(${THICK / 2}px)`}}>
              {front}
              <Shade turn={turn} dark={pose.dark} sheen={sheen} />
            </div>
            {back ? (
              <div style={{...faceBase, transform: `rotateY(180deg) translateZ(${THICK / 2}px)`}}>
                {back}
                <Shade turn={turn} dark={pose.dark} sheen={100 - sheen} />
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
