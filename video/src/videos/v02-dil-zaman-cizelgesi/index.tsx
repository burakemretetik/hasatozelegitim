import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FONT} from '../../shared/brand';

// Owned by the agent building v02. Keep everything for this video inside this folder.
export const meta = {
  id: 'v02',
  durationInFrames: 300,
  coverFrame: 0,
};

export const Video: React.FC = () => {
  return (
    <AbsoluteFill style={{background: C.cream, color: C.green, fontFamily: FONT.heading, alignItems: 'center', justifyContent: 'center', fontSize: 80}}>
      v02 placeholder
    </AbsoluteFill>
  );
};
