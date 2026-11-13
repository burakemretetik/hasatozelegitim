import React from 'react';
import {AbsoluteFill, Sequence, useCurrentFrame} from 'remotion';
import {C} from '../../shared/brand';
import {Wipe} from './kit';
import {PLANS, ScenePlan} from './scenes';
import {T, TAIL} from './timing';

/* Global schedule: each scene starts EXIT_LEAD frames after the previous one begins leaving. */
const SCHEDULE = (() => {
  let start = 0;
  return PLANS.map((p, i) => {
    const isLast = i === PLANS.length - 1;
    const dur = isLast ? T.OUTRO : p.exitAt + TAIL;
    const s = {plan: p, start, dur};
    start += p.exitAt + T.EXIT_LEAD;
    return s;
  });
})();
const TOTAL = SCHEDULE[SCHEDULE.length - 1].start + T.OUTRO;
const HOOK_SETTLED = 120;

export const meta = {
  id: 'v01',
  durationInFrames: TOTAL,
  coverFrame: HOOK_SETTLED,
};

const Scene: React.FC<{plan: ScenePlan}> = ({plan}) => {
  const f = useCurrentFrame();
  const {Comp} = plan;
  return (
    <Wipe f={f} dir={plan.dir === 'none' ? 'up' : plan.dir} none={plan.dir === 'none'} accent={plan.accent} bg={plan.pal.bg}>
      <Comp f={f} />
    </Wipe>
  );
};

export const Video: React.FC = () => (
  <AbsoluteFill style={{background: C.cream}}>
    {SCHEDULE.map(({plan, start, dur}) => (
      <Sequence key={plan.key} from={start} durationInFrames={dur} layout="none">
        <Scene plan={plan} />
      </Sequence>
    ))}
  </AbsoluteFill>
);
