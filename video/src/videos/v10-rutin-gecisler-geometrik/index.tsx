import React from 'react';
import {AbsoluteFill, Sequence} from 'remotion';
import {COL} from './theme';
import {WipeIn} from './parts';
import {DUR, ORDER, SceneKey, START, TOTAL, WIPE} from './timeline';
import {Hook} from './scenes/Hook';
import {Title} from './scenes/Title';
import {Tip1} from './scenes/Tip1';
import {Tip2} from './scenes/Tip2';
import {Tip3} from './scenes/Tip3';
import {Flex} from './scenes/Flex';
import {Close} from './scenes/Close';
import {Outro} from './scenes/Outro';

// v10 – "Geçişleri kolaylaştırmak" · Bauhaus / Swiss geometric
export const meta = {
  id: 'v10',
  durationInFrames: TOTAL,
  coverFrame: 300,
};

const SCENES: Record<SceneKey, {C: React.FC; bar: string; reverse?: boolean}> = {
  hook: {C: Hook, bar: COL.orange},
  title: {C: Title, bar: COL.orange},
  tip1: {C: Tip1, bar: COL.orange, reverse: true},
  tip2: {C: Tip2, bar: COL.ink},
  tip3: {C: Tip3, bar: COL.ink, reverse: true},
  flex: {C: Flex, bar: COL.orange},
  close: {C: Close, bar: COL.orange, reverse: true},
  outro: {C: Outro, bar: COL.orange},
};

export const Video: React.FC = () => {
  return (
    <AbsoluteFill style={{background: COL.paper}}>
      {ORDER.map((k, i) => {
        const {C, bar, reverse} = SCENES[k];
        const last = i === ORDER.length - 1;
        const len = DUR[k] + (last ? 0 : WIPE);
        return (
          <Sequence key={k} from={START[k]} durationInFrames={len} name={k}>
            {i === 0 ? (
              <C />
            ) : (
              <WipeIn bar={bar} reverse={reverse}>
                <C />
              </WipeIn>
            )}
          </Sequence>
        );
      })}
    </AbsoluteFill>
  );
};
