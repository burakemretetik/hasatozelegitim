import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C, FONT} from '../../shared/brand';

// Owned by the agent building v08. Keep everything for this video inside this folder.
export const meta = {
  id: 'v08',
  durationInFrames: 300,
  coverFrame: 0,
};

export const Video: React.FC = () => {
  return (
    <AbsoluteFill style={{background: C.cream, color: C.green, fontFamily: FONT.heading, alignItems: 'center', justifyContent: 'center', fontSize: 80}}>
      v08 placeholder
    </AbsoluteFill>
  );
};
