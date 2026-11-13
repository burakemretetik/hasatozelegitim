import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {HasatLogo} from '../../../shared/brand';
import {COL, EASE, EASE_OUT, FF, prog} from '../theme';
import {Grid, Line} from '../parts';
import {IN} from '../timeline';

/** Brand outro – the three tip-shapes settle into a row above the Hasat logo. */
export const Outro: React.FC = () => {
  const f = useCurrentFrame();
  const shapes = [
    {kind: 'circle', color: COL.orange},
    {kind: 'triangle', color: COL.brick},
    {kind: 'square', color: COL.ink},
  ] as const;
  const logoP = prog(f, IN + 8, 22, EASE);

  return (
    <AbsoluteFill style={{background: COL.paper}}>
      <Grid color={COL.ink} opacity={0.12} at={IN - 8} />
      {shapes.map((s, i) => {
        const p = prog(f, IN - 4 + i * 5, 18, EASE);
        const size = 110;
        const x = 540 - 1.5 * size - 40 + i * (size + 40);
        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 100 100"
            style={{
              position: 'absolute',
              left: x + (1 - p) * -200,
              top: 560,
              opacity: p > 0 ? 1 : 0,
              transform: `rotate(${(1 - p) * -180}deg)`,
            }}
          >
            {s.kind === 'circle' && <circle cx={50} cy={50} r={50} fill={s.color} />}
            {s.kind === 'square' && <rect x={0} y={0} width={100} height={100} fill={s.color} />}
            {s.kind === 'triangle' && <path d="M50 0 L100 100 L0 100 Z" fill={s.color} />}
          </svg>
        );
      })}
      <div
        style={{
          position: 'absolute',
          left: 540 - 360,
          top: 740,
          clipPath: `inset(0 ${(1 - logoP) * 100}% 0 0)`,
        }}
      >
        <HasatLogo width={720} />
      </div>
      <div style={{position: 'absolute', left: 0, right: 0, top: 1190, display: 'flex', justifyContent: 'center', fontFamily: FF}}>
        <Line at={IN + 26} size={60} weight={500}>
          Yazının tamamı blogumuzda.
        </Line>
      </div>
    </AbsoluteFill>
  );
};
