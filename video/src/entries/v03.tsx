// AUTO-GENERATED: single-composition entry used for fast, isolated previews.
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {VIDEO} from '../shared/brand';
import {Video, meta} from '../videos/v03-yol-haritasi-metro';

const Root: React.FC = () => (
  <Composition id="v03" component={Video} durationInFrames={meta.durationInFrames} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
);
registerRoot(Root);
