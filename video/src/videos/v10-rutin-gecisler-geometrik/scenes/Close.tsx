import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COL, EASE, EASE_OUT, kf, morphPath, prog} from '../theme';
import {Grid, Line} from '../parts';
import {IN} from '../timeline';

const CX = 540;
const CY = 545;
const HALF = 240;

/** Closing – change happens inside a stable frame: a safe environment. */
export const Close: React.FC = () => {
  const f = useCurrentFrame();
  const frameP = prog(f, IN - 4, 26, EASE);
  const per = 4 * HALF * 2;
  const innerP = prog(f, IN + 12, 16, EASE_OUT);
  // calm morph cycle inside the frame: circle → square → triangle → circle
  const t1 = prog(f, IN + 40, 28, EASE);
  const t2 = prog(f, IN + 96, 28, EASE);
  const t3 = prog(f, IN + 152, 28, EASE);
  let d: string;
  const r = 150 * innerP;
  if (t2 === 0) d = morphPath('circle', 'square', t1, CX, CY, r);
  else if (t3 === 0) d = morphPath('square', 'triangle', t2, CX, CY + 18 * t2, r);
  else d = morphPath('triangle', 'circle', t3, CX, CY + 18 * (1 - t3), r);
  const rot = kf(f, [IN + 40, IN + 68], [0, 0]);

  return (
    <AbsoluteFill style={{background: COL.ink}}>
      <Grid color={COL.paper} opacity={0.08} at={IN - 8} />
      <svg width={1080} height={1000} style={{position: 'absolute', left: 0, top: 0}}>
        <rect
          x={CX - HALF}
          y={CY - HALF}
          width={HALF * 2}
          height={HALF * 2}
          fill="none"
          stroke={COL.sage}
          strokeWidth={12}
          strokeDasharray={per}
          strokeDashoffset={per * (1 - frameP)}
        />
        <path d={d} fill={COL.orange} transform={`rotate(${rot} ${CX} ${CY})`} />
      </svg>

      <div style={{position: 'absolute', left: 80, top: 890}}>
        <Line at={IN + 4} size={72} weight={300} color={COL.paper}>
          Böylece çocuk,
        </Line>
        <Line at={IN + 9} size={72} weight={300} color={COL.paper}>
          değişikliklerle başa
        </Line>
        <Line at={IN + 14} size={72} weight={300} color={COL.paper}>
          çıkmayı da
        </Line>
      </div>
      <div style={{position: 'absolute', left: 80, top: 1160}}>
        <Line at={IN + 30} size={112} weight={800} color={COL.orange}>
          güvenli bir
        </Line>
        <Line at={IN + 35} size={112} weight={800} color={COL.orange}>
          ortamda <span style={{color: COL.paper}}>öğrenir.</span>
        </Line>
      </div>
    </AbsoluteFill>
  );
};
