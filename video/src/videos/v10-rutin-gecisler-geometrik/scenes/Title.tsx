import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COL, EASE, prog} from '../theme';
import {Grid, Line} from '../parts';
import {IN} from '../timeline';

/** Title – "Geçişleri kolaylaştırmak için / 3 öneri". Green poster, giant orange 3. */
export const Title: React.FC = () => {
  const f = useCurrentFrame();

  // the three tip-shapes drop onto the grid one by one
  const shapes = [
    {kind: 'circle', color: COL.orange},
    {kind: 'triangle', color: COL.brick},
    {kind: 'square', color: COL.paper},
  ] as const;

  return (
    <AbsoluteFill style={{background: COL.ink}}>
      <Grid color={COL.paper} opacity={0.08} at={IN - 6} />
      <div style={{position: 'absolute', left: 80, top: 300}}>
        <Line at={IN} size={84} weight={300} color={COL.paper}>
          Geçişleri
        </Line>
        <Line at={IN + 5} size={84} weight={300} color={COL.paper}>
          kolaylaştırmak için
        </Line>
      </div>

      {/* giant 3 – rises out of a fixed mask like every other line of type */}
      <div style={{position: 'absolute', left: 40, top: 540}}>
        <Line at={IN + 8} size={1040} weight={800} lh={0.8} color={COL.orange} track={-40} dur={24}>
          3
        </Line>
      </div>
      <div style={{position: 'absolute', left: 640, top: 1240}}>
        <Line at={IN + 22} size={150} weight={600} color={COL.paper}>
          öneri
        </Line>
      </div>

      {/* tip shapes */}
      {shapes.map((s, i) => {
        const p = prog(f, IN + 30 + i * 6, 18, EASE);
        const x = 650 + i * 100;
        const y = 700 + (1 - p) * -200;
        const size = 84;
        return (
          <svg
            key={i}
            width={size}
            height={size}
            viewBox="0 0 100 100"
            style={{
              position: 'absolute',
              left: x,
              top: y,
              opacity: p > 0 ? 1 : 0,
              transform: `rotate(${(1 - p) * 90}deg)`,
              clipPath: 'none',
            }}
          >
            {s.kind === 'circle' && <circle cx={50} cy={50} r={50} fill={s.color} />}
            {s.kind === 'square' && <rect x={0} y={0} width={100} height={100} fill={s.color} />}
            {s.kind === 'triangle' && <path d="M50 0 L100 100 L0 100 Z" fill={s.color} />}
          </svg>
        );
      })}
    </AbsoluteFill>
  );
};
