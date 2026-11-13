// Props on the stage: torn timetable, clock, paper frame, wheat stalks.
import React from 'react';
import {random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {noise2D} from '@remotion/noise';
import {
  Bit,
  circlePts,
  lensPts,
  memo,
  outlineDense,
  outlineRect,
  P,
  PaperSvg,
  Piece,
  place,
  polyPts,
  Pt,
  rimOf,
  roundRectPts,
  shadowCss,
  stepF,
} from './paper';
import {T} from './timing';

const toD = (pts: Pt[]) => 'M' + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L') + 'Z';

// ---------------------------------------------------------------- rigid timetable that tears in two
const GW = 560;
const GH = 372;
const tearPts = (() => {
  const pts: Pt[] = [];
  for (let y = 0; y <= GH; y += 6) {
    const yy = Math.min(y, GH);
    pts.push([GW * 0.47 + (yy / GH) * GW * 0.07 + 8 * noise2D('tear', yy * 0.03, 0) + 3 * (random('tr' + yy) - 0.5), yy]);
  }
  if (pts[pts.length - 1][1] !== GH) pts.push([GW * 0.54, GH]);
  return pts;
})();
const rimW = (i: number) => 1.6 + 2.6 * Math.abs(noise2D('tearRim', i * 0.15, 0)) + random('tw' + i);
const HALVES = {
  whole: toD([
    [0, 0],
    [GW, 0],
    [GW, GH],
    [0, GH],
  ]),
  left: toD([[0, 0], ...tearPts, [0, GH]]),
  leftRim: toD([[0, 0], ...tearPts.map(([x, y], i) => [x + rimW(i), y] as Pt), [0, GH]]),
  right: toD([tearPts[0], [GW, 0], [GW, GH], ...[...tearPts].reverse()]),
  rightRim: toD([tearPts[0], [GW, 0], [GW, GH], ...[...tearPts].map(([x, y], i) => [x - rimW(i + 50), y] as Pt).reverse()]),
};
const CELLS: Array<[number, number, string]> = [
  [0, 0, P.orange],
  [2, 0, P.sage],
  [5, 1, P.orange],
  [1, 2, P.greenSoft],
  [3, 2, P.orange],
  [6, 3, P.sage],
  [0, 4, P.sage],
  [4, 4, P.orange],
  [2, 5, P.orange],
  [5, 6, P.greenSoft],
  [1, 7, P.orange],
  [3, 8, P.sage],
  [6, 8, P.orange],
];

const GridContent: React.FC<{clip: string}> = ({clip}) => (
  <g clipPath={`url(#${clip})`}>
    <rect width={GW} height={GH} fill={P.paper} />
    <rect width={GW} height={GH} fill="url(#hs-grid)" />
    <rect width={GW} height={58} fill={P.green} />
    {Array.from({length: 7}, (_, i) => (
      <rect key={i} x={26 + i * 76} y={20} width={44} height={18} rx={3} fill={P.sageLight} opacity={0.9} />
    ))}
    {CELLS.map(([c, r, col], i) => (
      <rect key={i} x={22 + c * 76} y={74 + r * 33} width={64} height={25} rx={2} fill={col} />
    ))}
    <rect width={GW} height={GH} fill="url(#hs-tex0)" opacity={0.6} />
  </g>
);

export const GraphCard: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pose = place(frame, fps, {
    seed: 'gc',
    enter: T.rutin.card,
    from: {y: 760, rot: 5},
    rest: -2.5,
    exit: T.rutin.exit,
    to: {y: 900, rot: 6},
    liftAmt: 0.25,
    exitDur: 16,
    config: {damping: 16, stiffness: 110, mass: 1},
  });
  if (!pose.on) return null;
  const f = stepF(frame);
  const torn = f >= T.rutin.tear;
  const q = torn ? spring({frame: f - T.rutin.tear, fps, config: {damping: 12, stiffness: 120, mass: 0.9}}) : 0;
  const lift = torn ? 0.5 * Math.sin(Math.PI * Math.min(1, q)) : 0;
  const half = (side: 'left' | 'right') => {
    const k = side === 'left' ? -1 : 1;
    const d = side === 'left' ? HALVES.left : HALVES.right;
    const rim = side === 'left' ? HALVES.leftRim : HALVES.rightRim;
    const id = 'gc-' + side;
    return (
      <div
        key={side}
        style={{
          position: 'absolute',
          inset: 0,
          transform: `translate(${(k * (side === 'left' ? 74 : 84) * q).toFixed(1)}px, ${((side === 'left' ? 26 : 46) * q).toFixed(1)}px) rotate(${(k * (side === 'left' ? 7 : 9) * q).toFixed(2)}deg)`,
          transformOrigin: side === 'left' ? '25% 60%' : '75% 60%',
          filter: shadowCss(lift),
        }}
      >
        <svg width={GW} height={GH} style={{position: 'absolute', overflow: 'visible'}}>
          <defs>
            <clipPath id={id}>
              <path d={d} />
            </clipPath>
          </defs>
          <path d={rim} fill={rimOf(P.paper)} />
          <GridContent clip={id} />
        </svg>
      </div>
    );
  };
  return (
    <Piece x={510} y={1080} w={GW} h={GH} pose={pose} shadow={0}>
      {torn ? (
        [half('left'), half('right')]
      ) : (
        <div style={{position: 'absolute', inset: 0, filter: shadowCss(pose.lift)}}>
          <svg width={GW} height={GH} style={{position: 'absolute', overflow: 'visible'}}>
            <defs>
              <clipPath id="gc-whole">
                <path d={HALVES.whole} />
              </clipPath>
            </defs>
            <GridContent clip="gc-whole" />
          </svg>
        </div>
      )}
    </Piece>
  );
};

// ---------------------------------------------------------------- clock: hands rush, then six of twelve ticks fall away
export const Clock: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const pose = place(frame, fps, {
    seed: 'clock',
    enter: T.saat.clock,
    from: {y: 820, rot: -10},
    rest: 2,
    exit: T.saat.exit - 4,
    to: {y: 920, rot: 8},
    liftAmt: 0.2,
    exitDur: 16,
    config: {damping: 16, stiffness: 110, mass: 1},
  });
  if (!pose.on) return null;
  const f = stepF(frame);
  const back = memo('clk-back', () => outlineDense(circlePts(0, 0, 214), 'clkb', 'cut', 1.2));
  const face = memo('clk-face', () => outlineDense(circlePts(0, 0, 192), 'clkf', 'cut', 1.2));
  const tick = (i: number) => memo('tick' + (i % 3), () => outlineDense(roundRectPts(-9, -19, 18, 38, 3, 3), 'tk' + (i % 3), 'cut', 0.6));
  const minute = memo('min', () => outlineDense(roundRectPts(-7, -150, 14, 172, 7, 4), 'mh', 'cut', 0.6));
  const hour = memo('hour', () => outlineDense(roundRectPts(-9, -104, 18, 124, 9, 4), 'hh', 'cut', 0.6));
  const pin = memo('pin', () => outlineDense(circlePts(0, 0, 18), 'cpin', 'cut', 0.6));
  const t = Math.max(0, f - (T.saat.clock + 6));
  const spin = 1440 * (1 - Math.exp(-t / 14));
  const odd = [1, 3, 5, 7, 9, 11];
  return (
    <Piece x={510} y={1064} w={460} h={460} pose={pose}>
      <svg width={460} height={460} viewBox="-230 -230 460 460" style={{position: 'absolute', overflow: 'visible'}}>
        <path d={back.d} fill={P.green} />
        <path d={back.d} fill="url(#hs-tex1)" opacity={0.6} />
        <g filter="url(#hs-pshadow)">
          <path d={face.d} fill={P.paper} />
        </g>
        <path d={face.d} fill="url(#hs-tex0)" opacity={0.6} />
        {Array.from({length: 12}, (_, i) => {
          const a = i * 30;
          const px = 152 * Math.sin((a * Math.PI) / 180);
          const py = -152 * Math.cos((a * Math.PI) / 180);
          let dx = 0;
          let dy = 0;
          let spinT = 0;
          const k = odd.indexOf(i);
          if (k >= 0) {
            const tt = f - (T.saat.drop + k * 3);
            if (tt > 0) {
              const dir = random('fall' + i) > 0.5 ? 1 : -1;
              dy = 0.55 * tt * tt + 2 * tt;
              dx = dir * 2.4 * tt;
              spinT = dir * 7 * tt;
            }
          }
          return (
            <g key={i} transform={`translate(${(px + dx).toFixed(1)} ${(py + dy).toFixed(1)}) rotate(${a + spinT})`}>
              <Bit o={tick(i)} color={i % 2 === 0 ? P.orange : P.greenSoft} rim={false} />
            </g>
          );
        })}
        <g transform={`rotate(${(60 + spin / 12).toFixed(2)})`}>
          <Bit o={hour} color={P.green} rim={false} />
        </g>
        <g transform={`rotate(${(-30 + spin).toFixed(2)})`}>
          <Bit o={minute} color={P.orangeDeep} rim={false} />
        </g>
        <Bit o={pin} color={P.orange} rim={false} />
        <circle r={6} fill={P.paper} />
      </svg>
    </Piece>
  );
};

// ---------------------------------------------------------------- "çerçeve": four green strips build a frame, clockwise
export const CerceveFrame: React.FC<{top: number; bottom: number}> = ({top, bottom}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const L = 98;
  const R = 922;
  const th = 30;
  const sides = [
    {x: (L + R) / 2, y: top, w: R - L + 40, h: th, from: {x: -1200}, rot: -0.6},
    {x: R, y: (top + bottom) / 2, w: th, h: bottom - top + 40, from: {y: -1500}, rot: 0.5},
    {x: (L + R) / 2, y: bottom, w: R - L + 40, h: th, from: {x: 1200}, rot: 0.4},
    {x: L, y: (top + bottom) / 2, w: th, h: bottom - top + 40, from: {y: 1500}, rot: -0.7},
  ];
  return (
    <>
      {sides.map((s, i) => {
        const horiz = s.w > s.h;
        const pose = place(frame, fps, {
          seed: 'fr' + i,
          enter: T.cerceve.frame + i * 5,
          from: {...s.from, rot: 0},
          rest: s.rot,
          exit: T.cerceve.exit + 2,
          to: {x: -1300, y: -60, rot: -5},
          liftAmt: 0.5,
        });
        const o = outlineRect(Math.round(s.w), Math.round(s.h), 'frs' + i, horiz ? ['cut', 'torn', 'cut', 'torn'] : ['torn', 'cut', 'torn', 'cut']);
        return (
          <Piece key={i} x={s.x} y={s.y} w={s.w} h={s.h} pose={pose}>
            <PaperSvg w={Math.round(s.w)} h={Math.round(s.h)} o={o} color={P.green} tex="hs-tex2" />
          </Piece>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- paper wheat (Hasat başak) growing from behind the hills
const GRAINS: Array<[number, number, number]> = [
  [0, -25, 0],
  [-13.7, 2, -32],
  [13.7, 2, 32],
  [-13.7, 25, -32],
  [13.7, 25, 32],
  [-13.7, 48, -32],
  [13.7, 48, 32],
];
const GRAIN_ORDER = [6, 4, 5, 2, 3, 0, 1];

export const WheatStalk: React.FC<{x: number; base: number; h: number; lean: number; start: number; seed: string; s?: number}> = ({
  x,
  base,
  h,
  lean,
  start,
  seed,
  s = 1,
}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const f = stepF(frame);
  if (f < start) return null;
  const p = spring({frame: f - start, fps, config: {damping: 16, stiffness: 70, mass: 1}});
  const rise = (h + 120) * (1 - p);
  const boil = (random(seed + stepF(frame, 3)) - 0.5) * 0.8;
  const stem = memo('stem' + seed, () =>
    outlineDense(
      polyPts([
        [-4, 0],
        [lean - 2.5, -h],
        [lean + 2.5, -h],
        [4, 0],
      ]),
      seed + 'st',
      'cut',
      0.5,
    ),
  );
  const leafL = memo('leafL' + seed, () => outlineDense(lensPts(lean * 0.4 - 26, -h * 0.4, 16, 86, -38), seed + 'll', 'cut', 0.6));
  const leafR = memo('leafR' + seed, () => outlineDense(lensPts(lean * 0.58 + 24, -h * 0.58, 14, 74, 36), seed + 'lr', 'cut', 0.6));
  const grain = (i: number) => memo('grain' + seed + i, () => outlineDense(lensPts(0, 0, 17, 44, 0), seed + 'g' + i, 'cut', 0.5));
  return (
    <svg
      width={10}
      height={10}
      style={{position: 'absolute', left: x, top: base, overflow: 'visible', transform: `translate(0px, ${rise.toFixed(1)}px) rotate(${boil}deg) scale(${s})`, transformOrigin: '0 0'}}
    >
      <Bit o={leafL} color={P.greenSoft} rim={false} />
      <Bit o={leafR} color="#7BA28C" rim={false} />
      <Bit o={stem} color={P.greenMid} rim={false} />
      <g transform={`translate(${lean} ${-h - 52})`}>
        {GRAINS.map(([gx, gy, r], i) => {
          const tt = f - (start + 14 + GRAIN_ORDER[i] * 2);
          if (tt < 0) return null;
          const sc = spring({frame: tt, fps, config: {damping: 11, stiffness: 170, mass: 0.6}});
          return (
            <g key={i} transform={`translate(${gx} ${gy}) rotate(${r}) scale(${sc.toFixed(3)})`}>
              <Bit o={grain(i)} color={P.orange} rim={false} />
            </g>
          );
        })}
      </g>
    </svg>
  );
};

export const WheatField: React.FC = () => {
  const s = T.closing.wheat;
  const stalks = [
    {x: 470, h: 430, lean: -26, d: 4},
    {x: 560, h: 450, lean: 22, d: 8},
    {x: 515, h: 520, lean: -4, d: 0},
    {x: 40, h: 380, lean: 14, d: 10},
    {x: 92, h: 290, lean: 20, d: 14},
    {x: 1004, h: 360, lean: -18, d: 12},
    {x: 1052, h: 280, lean: -10, d: 16},
  ];
  return (
    <>
      {stalks.map((k, i) => (
        <WheatStalk key={i} x={k.x} base={1462} h={k.h} lean={k.lean} start={s + k.d} seed={'wh' + i} />
      ))}
    </>
  );
};
