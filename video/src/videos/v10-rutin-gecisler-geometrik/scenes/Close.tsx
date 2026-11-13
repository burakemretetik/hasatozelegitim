import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {COL, EASE, EASE_OUT, prog} from '../theme';
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
  // calm morph cycle inside the frame: circle → square → circle → square, each in a 90° step
  const t1 = prog(f, IN + 40, 28, EASE);
  const t2 = prog(f, IN + 96, 28, EASE);
  const t3 = prog(f, IN + 152, 28, EASE);
  const round = 1 - t1 + t2 - t3;
  const rot = 90 * (t1 + t2 + t3);
  const half = 150 * innerP;

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
        <rect
          x={CX - half}
          y={CY - half}
          width={half * 2}
          height={half * 2}
          rx={half * round}
          fill={COL.orange}
          transform={`rotate(${rot} ${CX} ${CY})`}
        />
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
