import React from 'react';
import {AbsoluteFill, Easing, useCurrentFrame} from 'remotion';
import {BackCover, Page1, Page2, Page3} from './pages';
import {tween} from './kit';
import {DURATION, T, TURN} from './timing';

// v04 · "Biraz daha bekleyelim mi?" — Editorial / print magazine essay.
export const meta = {
  id: 'v04',
  durationInFrames: DURATION,
  coverFrame: 120,
};

const W = 1080;
const PERSPECTIVE = 3400;
const TURN_EASE = Easing.bezier(0.5, 0.02, 0.22, 1);

/**
 * Page turn around the left-hand spine: the page lifts toward the reader and swings away,
 * revealing the next page, which receives a soft cast shadow along the lifting edge.
 */
const PageTurn: React.FC<{start: number; over: React.ReactNode; under: React.ReactNode}> = ({start, over, under}) => {
  const f = useCurrentFrame();
  const p = tween(f, start, start + TURN, TURN_EASE);
  const phi = (p * 92 * Math.PI) / 180; // lift angle
  // projected x of the free (right) edge at mid-height
  const xr = W * Math.cos(phi);
  const zr = W * Math.sin(phi);
  const edge = 540 + (xr - 540) * (PERSPECTIVE / Math.max(1, PERSPECTIVE - zr));
  const lift = Math.sin(phi);
  const shadowW = 120 + 260 * lift;
  const shadowA = 0.34 * Math.sin(Math.min(1, p * 1.15) * Math.PI) + 0.06 * (1 - p);
  return (
    <AbsoluteFill>
      {under}
      {/* ambient occlusion on the page below, fading as the page lifts away */}
      <AbsoluteFill style={{background: `rgba(30,24,12,${(0.16 * (1 - p)).toFixed(3)})`}} />
      {/* cast shadow just beyond the turning edge */}
      {p < 1 ? (
        <div
          style={{
            position: 'absolute',
            top: 0,
            bottom: 0,
            left: edge - 4,
            width: shadowW,
            background: `linear-gradient(90deg, rgba(30,24,12,${shadowA.toFixed(3)}) 0%, rgba(30,24,12,${(shadowA * 0.35).toFixed(
              3,
            )}) 35%, rgba(30,24,12,0) 100%)`,
          }}
        />
      ) : null}
      {p < 1 ? (
        <AbsoluteFill style={{perspective: PERSPECTIVE, perspectiveOrigin: '50% 50%'}}>
          <AbsoluteFill
            style={{
              transformOrigin: '0% 50%',
              transform: `rotateY(${(-p * 92).toFixed(3)}deg)`,
              backfaceVisibility: 'hidden',
            }}
          >
            {over}
            {/* light falloff across the lifting page */}
            <AbsoluteFill
              style={{
                background: `linear-gradient(90deg, rgba(255,250,235,${(0.1 * lift).toFixed(3)}) 0%, rgba(30,24,12,0) 45%, rgba(30,24,12,${(
                  0.26 * lift
                ).toFixed(3)}) 100%)`,
              }}
            />
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}
    </AbsoluteFill>
  );
};

export const Video: React.FC = () => {
  const f = useCurrentFrame();
  let scene: React.ReactNode;
  if (f < T.turn1) scene = <Page1 />;
  else if (f < T.turn1 + TURN) scene = <PageTurn start={T.turn1} over={<Page1 />} under={<Page2 />} />;
  else if (f < T.turn2) scene = <Page2 />;
  else if (f < T.turn2 + TURN) scene = <PageTurn start={T.turn2} over={<Page2 />} under={<Page3 />} />;
  else if (f < T.turn3) scene = <Page3 />;
  else if (f < T.turn3 + TURN) scene = <PageTurn start={T.turn3} over={<Page3 />} under={<BackCover />} />;
  else scene = <BackCover />;
  return (
    <AbsoluteFill style={{background: '#000'}}>
      {scene}
    </AbsoluteFill>
  );
};
