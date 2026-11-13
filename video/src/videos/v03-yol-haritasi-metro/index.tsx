import React from 'react';
import {AbsoluteFill, useCurrentFrame} from 'remotion';
import {C} from '../../shared/brand';
import * as T from './timeline';
import {cameraAt} from './map';
import {MapSvg} from './MapSvg';
import {WorldLabels} from './Labels';
import {Closing, Hud, Outro} from './Overlays';

// v03 — "Endişelendiniz: şimdi ne yapmalı?" · Transit / metro map style.
export const meta = {
  id: 'v03',
  durationInFrames: T.END,
  coverFrame: 60,
};

export const Video: React.FC = () => {
  const f = useCurrentFrame();
  const cam = cameraAt(f);
  return (
    <AbsoluteFill style={{background: C.cream, overflow: 'hidden'}}>
      <MapSvg f={f} cam={cam} />
      <WorldLabels f={f} cam={cam} />
      <Hud f={f} />
      <Closing f={f} />
      <Outro f={f} />
    </AbsoluteFill>
  );
};
