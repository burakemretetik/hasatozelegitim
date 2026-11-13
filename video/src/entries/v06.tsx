// AUTO-GENERATED: single-composition entry used for fast, isolated previews.
import React from 'react';
import {Composition, registerRoot} from 'remotion';
import {VIDEO} from '../shared/brand';
import {Video, meta} from '../videos/v06-iki-dil-sohbet';

const Root: React.FC = () => (
  <Composition id="v06" component={Video} durationInFrames={meta.durationInFrames} fps={VIDEO.fps} width={VIDEO.width} height={VIDEO.height} />
);
registerRoot(Root);
