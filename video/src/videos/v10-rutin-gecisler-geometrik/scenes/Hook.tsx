import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COL, EASE, EASE_OUT, kf, prog} from '../theme';
import {Grid, Line} from '../parts';

/**
 * Hook – activity A (orange circle) has to become activity B (green square).
 * It strains: pushes forward, recoils, pushes again, and finally locks into the slot.
 */
export const Hook: React.FC = () => {
  const f = useCurrentFrame();

  // strain keyframes
  const K = [0, 40, 64, 80, 104, 120, 146];
  const cx = kf(f, K, [262, 262, 392, 344, 572, 528, 772]);
  const round = kf(f, K, [1, 1, 0.64, 0.82, 0.32, 0.46, 0]); // 1 = circle, 0 = square
  const sx = kf(f, K, [1, 1, 1.16, 0.95, 1.13, 0.97, 1]);
  const sy = kf(f, K, [1, 1, 0.88, 1.03, 0.9, 1.02, 1]);
  const fill = COL.orange;
  const ghostP = prog(f, 52, 20, EASE_OUT); // outline of A stays behind once it leaves
  const S = 300; // shape size
  const cy = 560;

  // slot outline + arrow
  const slotP = 0.6 + 0.4 * prog(f, 0, 14, EASE_OUT);
  const arrowOut = prog(f, 96, 18, EASE); // arrow retracts as the shape passes
  const lockP = prog(f, 146, 14, EASE_OUT);

  return (
    <AbsoluteFill style={{background: COL.paper}}>
      <Grid color={COL.ink} opacity={0.12} />
      {/* big pale quarter circle, top-right – poster ground */}
      <div
        style={{
          position: 'absolute',
          right: -260,
          top: -260,
          width: 760,
          height: 760,
          borderRadius: '50%',
          background: COL.panel,
        }}
      />
      {/* heavy rule under the graphic */}
      <div style={{position: 'absolute', left: 80, top: 860, width: 860 * prog(f, 0, 22, EASE), height: 12, background: COL.ink}} />

      {/* slot B */}
      <div
        style={{
          position: 'absolute',
          left: 772 - S / 2,
          top: cy - S / 2,
          width: S,
          height: S,
          boxSizing: 'border-box',
          border: `6px solid ${COL.ink}`,
          transform: `scale(${0.9 + 0.1 * slotP})`,
          opacity: slotP,
        }}
      />
      {/* corner ticks that close on lock */}
      {[0, 1, 2, 3].map((i) => {
        const dx = i % 2 === 0 ? -1 : 1;
        const dy = i < 2 ? -1 : 1;
        const off = S / 2 + 26 - 10 * lockP;
        return (
          <div
            key={i}
            style={{
              position: 'absolute',
              left: 772 + dx * off - 14,
              top: cy + dy * off - 14,
              width: 28,
              height: 28,
              background: COL.ink,
              transform: `scale(${lockP})`,
            }}
          />
        );
      })}

      {/* arrow A → B */}
      <svg width={1080} height={1080} style={{position: 'absolute', left: 0, top: 0}}>
        <g opacity={1 - arrowOut}>
          <rect x={440} y={cy - 4} width={150 * (1 - arrowOut)} height={8} fill={COL.ink} />
          <path d={`M ${590 - 150 * arrowOut} ${cy - 22} L ${622 - 150 * arrowOut} ${cy} L ${590 - 150 * arrowOut} ${cy + 22} Z`} fill={COL.ink} />
        </g>
      </svg>

      {/* ghost of A */}
      <div
        style={{
          position: 'absolute',
          left: 262 - S / 2,
          top: cy - S / 2,
          width: S,
          height: S,
          boxSizing: 'border-box',
          borderRadius: '50%',
          border: `6px solid ${COL.orange}`,
          opacity: ghostP,
          transform: `scale(${0.8 + 0.2 * ghostP})`,
        }}
      />
      {/* the straining shape */}
      <div
        style={{
          position: 'absolute',
          left: cx - S / 2,
          top: cy - S / 2,
          width: S,
          height: S,
          background: fill,
          borderRadius: `${round * 50}%`,
          transform: `scale(${sx}, ${sy})`,
        }}
      />

      {/* type */}
      <div style={{position: 'absolute', left: 80, top: 940}}>
        <Line at={0} size={84} weight={400}>
          En çok zorlanılan
        </Line>
        <Line at={5} size={84} weight={400}>
          anlar genellikle bir
        </Line>
        <Line at={10} size={84} weight={400}>
          etkinlikten diğerine
        </Line>
        <div style={{position: 'relative', marginTop: 34}}>
          <div
            style={{
              position: 'absolute',
              left: -80,
              top: 6,
              height: 168,
              width: 870 * prog(f, 14, 18, EASE),
              background: COL.orange,
            }}
          />
          <Line at={20} size={150} weight={800} style={{position: 'relative', paddingLeft: 18}}>
            geçişlerdir.
          </Line>
        </div>
      </div>
    </AbsoluteFill>
  );
};
