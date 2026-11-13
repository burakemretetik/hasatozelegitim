import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {C} from '../../shared/brand';
import {ChatList} from './chat';
import {Device, Header, InputDock} from './chrome';
import {Outro, Statement} from './finale';
import {CARD_AT, TOTAL, sp} from './timeline';

// v06 — "Evde sadece Almanca mı konuşalım?" · Messaging conversation
export const meta = {
  id: 'v06',
  durationInFrames: TOTAL,
  coverFrame: 120,
};

export const Video: React.FC = () => {
  const f = useCurrentFrame();
  // gentle settle of the phone on the very first frames (content is visible from frame 0)
  const settle = sp(f + 6, {damping: 200, stiffness: 90});
  const chatAlive = f < CARD_AT + 2;
  return (
    <AbsoluteFill style={{background: C.greenDeep}}>
      {chatAlive ? (
        <AbsoluteFill style={{transform: `scale(${interpolate(settle, [0, 1], [1.035, 1])})`}}>
          <Device>
            <ChatList f={f} />
            <Header f={f} />
            <InputDock f={f} />
          </Device>
        </AbsoluteFill>
      ) : null}
      <Statement f={f} />
      <Outro f={f} />
    </AbsoluteFill>
  );
};
