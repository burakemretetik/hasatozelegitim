// The paper stage: sky, hills, house, tree, clouds, sun/moon, dusk sheet and night vellum.
import React from 'react';
import {AbsoluteFill, Easing, interpolate, random, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {noise2D} from '@remotion/noise';
import {
  Bit,
  memo,
  outlineDense,
  outlinePoly,
  circlePts,
  crescentPts,
  P,
  PaperSvg,
  Pt,
  Outline,
  polyPts,
  rimOf,
  roundRectPts,
  shadowCss,
  starPts,
  stepF,
} from './paper';
import {DUSK, FLIP, NIGHT, SUN_SWITCH, T} from './timing';

const W = 1080;
const H = 1920;
const g = (x: number, c: number, w: number) => Math.exp(-(((x - c) / w) ** 2));
const toD = (pts: Pt[]) => 'M' + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join('L') + 'Z';

// ---------------------------------------------------------------- sky
export const Sky: React.FC = () => {
  const top = memo('sky-top', () =>
    outlinePoly(
      [
        [-40, -40],
        [1120, -40],
        [1120, 600],
        [-40, 520],
      ],
      ['cut', 'cut', 'torn', 'cut'],
      'skytop',
      1.6,
    ),
  );
  const low = memo('sky-low', () =>
    outlinePoly(
      [
        [-40, 1010],
        [1120, 950],
        [1120, 1960],
        [-40, 1960],
      ],
      ['torn', 'cut', 'cut', 'cut'],
      'skylow',
      1.6,
    ),
  );
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      <rect width={W} height={H} fill={P.sky} />
      <rect width={W} height={H} fill="url(#hs-tex0)" opacity={0.55} />
      {[
        [top, P.skyTop],
        [low, P.skyLow],
      ].map(([o, c], i) => (
        <g key={i}>
          <g filter="url(#hs-bshadow)">
            <path d={(o as Outline).rim} fill={rimOf(c as string)} />
            <path d={(o as Outline).d} fill={c as string} />
          </g>
          <path d={(o as Outline).d} fill={`url(#hs-tex${i + 1})`} opacity={0.55} />
        </g>
      ))}
    </svg>
  );
};

/** warm evening sheet lowered over the sky at "Banyo" */
export const DuskSheet: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const f = stepF(frame);
  if (f < DUSK) return null;
  const p = spring({frame: f - DUSK, fps, config: {damping: 20, stiffness: 60, mass: 1}});
  const e = interpolate(f, [T.weekend.lift, T.weekend.lift + 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });
  if (e >= 1) return null;
  const y = -1650 * (1 - p) - 1750 * e;
  const sheet = memo('dusk', () =>
    outlinePoly(
      [
        [-40, -40],
        [1120, -40],
        [1120, 1490],
        [-40, 1450],
      ],
      ['cut', 'cut', 'torn', 'cut'],
      'dusk',
      2,
    ),
  );
  const band = memo('dusklow', () =>
    outlinePoly(
      [
        [-40, 1000],
        [1120, 930],
        [1120, 1440],
        [-40, 1420],
      ],
      ['torn', 'cut', 'cut', 'cut'],
      'dusklow',
      1.6,
    ),
  );
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <g transform={`translate(0 ${y.toFixed(1)})`}>
        <g filter="url(#hs-bshadow)">
          <path d={sheet.rim} fill={rimOf(P.dusk)} />
          <path d={sheet.d} fill={P.dusk} />
        </g>
        <path d={sheet.d} fill="url(#hs-tex3)" opacity={0.55} />
        <g filter="url(#hs-bshadow)">
          <path d={band.rim} fill={rimOf(P.duskLow)} />
          <path d={band.d} fill={P.duskLow} />
        </g>
        <path d={band.d} fill="url(#hs-tex1)" opacity={0.55} />
      </g>
    </svg>
  );
};

// ---------------------------------------------------------------- hills
const hillOutline = (yFn: (x: number) => number, seed: string, amp = 1.4): Outline =>
  memo('hill:' + seed, () => {
    const main: Pt[] = [];
    const rim: Pt[] = [];
    for (let x = -40; x <= 1120; x += 5) {
      const y = yFn(x);
      const o = amp * (2.6 * noise2D(seed, x * 0.02, 0) + 1.0 * noise2D(seed, x * 0.08, 2) + 0.9 * (random(seed + x) - 0.5));
      const r = amp * (1.4 + 2 * Math.abs(noise2D(seed + 'r', x * 0.04, 1)) + 0.8 * random(seed + 'q' + x));
      main.push([x, y + o]);
      rim.push([x, y + o - r]);
    }
    main.push([1120, 1980], [-40, 1980]);
    rim.push([1120, 1980], [-40, 1980]);
    return {d: toD(main), rim: toD(rim)};
  });

export const farY = (x: number) => 1330 - 75 * g(x, 220, 250) - 45 * g(x, 930, 260);
export const midY = (x: number) => 1418 - 52 * g(x, 820, 280) - 10 * Math.sin(x / 95);
export const nearY = (x: number) => 1478 - 42 * g(x, 160, 300) + 8 * Math.sin(x / 120);
const frontY = (x: number) => 1550 + 16 * Math.sin(x / 150 + 1);

const Hill: React.FC<{o: Outline; color: string; tex: string}> = ({o, color, tex}) => (
  <>
    <g filter="url(#hs-bshadow)">
      <path d={o.rim} fill={rimOf(color)} />
      <path d={o.d} fill={color} />
    </g>
    <path d={o.d} fill={`url(#${tex})`} opacity={0.6} />
  </>
);

export const FarHill: React.FC = () => (
  <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
    <Hill o={hillOutline(farY, 'far', 1.5)} color={P.sage} tex="hs-tex2" />
  </svg>
);

const rectO = (x: number, y: number, w: number, h: number, seed: string) =>
  memo(`hr:${seed}`, () =>
    outlinePoly(
      [
        [x, y],
        [x + w, y],
        [x + w, y + h],
        [x, y + h],
      ],
      ['cut'],
      seed,
      0.8,
    ),
  );

const Tuft: React.FC<{x: number; y: number; seed: string; frame: number}> = ({x, y, seed, frame}) => {
  const boil = (random(`${seed}${stepF(frame, 3)}`) - 0.5) * 1.6;
  const blades = memo('tuft' + seed, () =>
    outlineDense(
      polyPts([
        [-16, 0],
        [-12, -26],
        [-6, 0],
        [-3, 0],
        [2, -36],
        [6, 0],
        [9, 0],
        [17, -22],
        [16, 0],
      ]),
      seed,
      'cut',
      0.5,
    ),
  );
  return (
    <g transform={`translate(${x} ${y}) rotate(${boil.toFixed(2)})`}>
      <Bit o={blades} color="#4F7D69" rim={false} />
    </g>
  );
};

export const NearHills: React.FC = () => {
  const frame = useCurrentFrame();
  const canopy = memo('canopy', () => outlineDense(circlePts(985, 1212, 74), 'canopy', 'torn', 1));
  const canopy2 = memo('canopy2', () => outlineDense(circlePts(968, 1196, 44), 'canopy2', 'cut', 1));
  const roof = memo('roof', () =>
    outlinePoly(
      [
        [748, 1294],
        [825, 1220],
        [902, 1294],
      ],
      ['cut'],
      'roof',
      0.8,
    ),
  );
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0}}>
      {/* tree */}
      <Bit o={rectO(976, 1250, 20, 150, 'trunk')} color={P.kraftDark} rim={false} />
      <Bit o={canopy} color={P.greenSoft} tex />
      <Bit o={canopy2} color="#7BA28C" />
      {/* house */}
      <Bit o={rectO(860, 1222, 22, 56, 'chim')} color={P.kraftDark} rim={false} />
      <Bit o={rectO(766, 1284, 118, 104, 'walls')} color={P.kraftLight} rim={false} tex />
      <Bit o={roof} color={P.orange} rim={false} tex />
      <Bit o={rectO(758, 1284, 134, 9, 'eave')} color={P.orangeDeep} rim={false} />
      <Bit o={memo('door', () => outlineDense(roundRectPts(810, 1326, 32, 62, 14), 'door', 'cut', 0.6))} color={P.green} rim={false} />
      <Bit o={rectO(778, 1306, 24, 24, 'win')} color={P.paper} rim={false} />
      <Bit o={rectO(850, 1306, 24, 24, 'win2')} color={P.paper} rim={false} />
      <Hill o={hillOutline(midY, 'mid', 1.4)} color="#6E9883" tex="hs-tex1" />
      <Hill o={hillOutline(nearY, 'near', 1.4)} color="#3D6B5A" tex="hs-tex2" />
      {[70, 300, 470, 640, 930].map((x, i) => (
        <Tuft key={x} x={x} y={nearY(x) + 6} seed={'tf' + i} frame={frame} />
      ))}
      <Hill o={hillOutline(frontY, 'front', 1.3)} color="#21473C" tex="hs-tex3" />
    </svg>
  );
};

// ---------------------------------------------------------------- clouds
const cloudPts = (cx: number, cy: number, w: number): Pt[] => {
  const circles: Array<[number, number, number]> = [
    [-0.3 * w, 0.02 * w, 0.2 * w],
    [-0.02 * w, -0.1 * w, 0.27 * w],
    [0.27 * w, 0, 0.19 * w],
  ];
  const bottom = 0.13 * w;
  const pts: Pt[] = [];
  for (let i = 0; i < 140; i++) {
    const a = (i / 140) * Math.PI * 2;
    const ux = Math.cos(a);
    const uy = Math.sin(a);
    let d = 0;
    for (const [x, y, r] of circles) {
      const b = ux * x + uy * y;
      const disc = b * b - (x * x + y * y - r * r);
      if (disc >= 0) d = Math.max(d, b + Math.sqrt(disc));
    }
    if (uy > 0.01) d = Math.min(d, bottom / uy);
    pts.push([cx + ux * d, cy + uy * d]);
  }
  return pts;
};

export const Clouds: React.FC = () => {
  const frame = useCurrentFrame();
  const drift = stepF(frame, 4) * 0.05;
  const cl = [
    {x: 905, y: 640, w: 230, s: 'cl1', d: -1},
    {x: 150, y: 1060, w: 200, s: 'cl2', d: 1},
  ];
  return (
    <>
      {cl.map((c) => {
        const o = memo('cloud' + c.s, () => outlineDense(cloudPts(c.w / 2 + 20, c.w / 2, c.w), c.s, 'torn', 1));
        const box = c.w + 40;
        return (
          <div
            key={c.s}
            style={{
              position: 'absolute',
              left: c.x - box / 2 + drift * c.d,
              top: c.y - c.w / 2,
              width: box,
              height: c.w,
              filter: shadowCss(0.15),
            }}
          >
            <PaperSvg w={box} h={c.w} o={o} color={P.paper} tex="hs-tex1" />
          </div>
        );
      })}
    </>
  );
};

// ---------------------------------------------------------------- sun / moon
const DAWN: Pt = [250, 1262];
const station = (t: number): Pt => [170 + 748 * t, 330 - 120 * Math.sin(Math.PI * t)];
const STATIONS: Pt[] = [0, 0.2, 0.4, 0.6, 0.8, 1].map(station);
const MOVES: Array<{at: number; to: Pt; slow?: boolean}> = [
  {at: T.anchors.sunRise, to: STATIONS[0], slow: true},
  ...T.anchors.tags.slice(1).map((t, i) => ({at: t - 6, to: STATIONS[i + 1]})),
];

const sunPos = (frame: number, fps: number): {x: number; y: number; moving: boolean} => {
  const f = stepF(frame, 3);
  let pos: Pt = DAWN;
  let moving = false;
  for (const m of MOVES) {
    if (f < m.at) break;
    const p = spring({
      frame: f - m.at,
      fps,
      config: m.slow ? {damping: 18, stiffness: 55, mass: 1.1} : {damping: 14, stiffness: 100, mass: 0.9},
    });
    moving = p < 0.995;
    pos = [pos[0] + (m.to[0] - pos[0]) * p, pos[1] + (m.to[1] - pos[1]) * p];
  }
  return {x: pos[0], y: pos[1], moving};
};

const SunArt: React.FC<{frame: number}> = ({frame}) => {
  const disc = memo('sun-disc', () => outlineDense(circlePts(150, 150, 78), 'sun', 'torn', 1.1));
  const inner = memo('sun-in', () => outlineDense(circlePts(144, 143, 56), 'sunin', 'cut', 1));
  const ray = (i: number) =>
    memo('ray' + i, () => {
      const long = i % 2 === 0;
      return outlineDense(
        polyPts([
          [150 - 11, 150 - 70],
          [150, 150 - (long ? 116 : 100)],
          [150 + 11, 150 - 70],
        ]),
        'ray' + i,
        'cut',
        0.6,
      );
    });
  const spin = stepF(frame, 8) * 0.25;
  return (
    <svg width={300} height={300} style={{position: 'absolute', overflow: 'visible'}}>
      <g transform={`rotate(${spin} 150 150)`}>
        {Array.from({length: 12}, (_, i) => (
          <g key={i} transform={`rotate(${i * 30} 150 150)`}>
            <Bit o={ray(i)} color={i % 2 === 0 ? P.orange : P.orangeLight} rim={false} />
          </g>
        ))}
      </g>
      <Bit o={disc} color={P.orange} tex />
      <Bit o={inner} color={P.orangeLight} rim={false} />
    </svg>
  );
};

const MoonArt: React.FC = () => {
  const moon = memo('moon', () => outlineDense(crescentPts(150, 150, 76, -28), 'moon', 'cut', 1));
  const c1 = memo('crater1', () => outlineDense(circlePts(118, 128, 9), 'cr1', 'cut', 0.5));
  const c2 = memo('crater2', () => outlineDense(circlePts(110, 178, 6), 'cr2', 'cut', 0.5));
  return (
    <svg width={300} height={300} style={{position: 'absolute', overflow: 'visible'}}>
      <Bit o={moon} color={P.moon} tex />
      <Bit o={c1} color="#E3D7B8" rim={false} shadow={false} />
      <Bit o={c2} color="#E3D7B8" rim={false} shadow={false} />
    </svg>
  );
};

export const SunMoon: React.FC<{layer: 'low' | 'high'}> = ({layer}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if ((layer === 'low') !== frame < SUN_SWITCH) return null;
  const {x, y, moving} = sunPos(frame, fps);
  const f = stepF(frame);
  const u1 = interpolate(f, [FLIP, FLIP + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const u2 = interpolate(f, [T.weekend.flip, T.weekend.flip + 12], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
  const flipping = u2 > 0 ? u2 : u1;
  const sx = Math.max(0.04, Math.abs(Math.cos(Math.PI * flipping)));
  const moon = u1 >= 0.5 && u2 < 0.5;
  const flipLift = Math.sin(Math.PI * flipping);
  const jx = moving ? (random('sx' + stepF(frame, 3)) - 0.5) * 2 : 0;
  const jr = moving ? (random('sr' + stepF(frame, 3)) - 0.5) * 1.2 : 0;
  return (
    <div
      style={{
        position: 'absolute',
        left: x - 150 + jx,
        top: y - 150,
        width: 300,
        height: 300,
        transform: `rotate(${jr}deg) scale(${(sx * (1 + 0.05 * flipLift)).toFixed(3)}, ${(1 + 0.05 * flipLift).toFixed(3)})`,
        filter: shadowCss(0.1 + 0.6 * flipLift),
      }}
    >
      {moon ? <MoonArt /> : <SunArt frame={frame} />}
    </div>
  );
};

// ---------------------------------------------------------------- night vellum (with paper stars)
const STARS: Array<[number, number, number, string]> = [
  [110, 250, 20, P.orange],
  [300, 168, 15, P.moon],
  [470, 300, 22, P.moon],
  [640, 210, 16, P.orangeLight],
  [770, 380, 13, P.moon],
  [1034, 520, 18, P.moon],
  [48, 668, 16, P.orangeLight],
  [1038, 905, 20, P.orange],
  [44, 1066, 14, P.moon],
  [1030, 1240, 15, P.moon],
  [560, 412, 12, P.orangeLight],
  [40, 420, 12, P.moon],
];

export const Vellum: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const f = stepF(frame);
  if (f < NIGHT) return null;
  const p = spring({frame: f - NIGHT, fps, config: {damping: 20, stiffness: 70, mass: 1}});
  const e = interpolate(f, [T.weekend.lift, T.weekend.lift + 18], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });
  if (e >= 1) return null;
  const y = -2050 * (1 - p) - 2150 * e;
  const sheet = memo('vellum', () =>
    outlinePoly(
      [
        [-40, -60],
        [1120, -60],
        [1120, 1990],
        [-40, 1960],
      ],
      ['cut', 'cut', 'torn', 'cut'],
      'vellum',
      2.2,
    ),
  );
  return (
    <svg width={W} height={H} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      <g transform={`translate(0 ${y.toFixed(1)})`}>
        <g opacity={0.66}>
          <path d={sheet.rim} fill="#7D958D" />
          <path d={sheet.d} fill="#08201B" />
        </g>
        {STARS.map(([x, sy, r, c], i) => {
          const t = f - (NIGHT + 16 + i * 3);
          if (t < 0) return null;
          const s = spring({frame: t, fps, config: {damping: 11, stiffness: 160, mass: 0.6}});
          const o = memo('star' + i, () => outlineDense(starPts(0, 0, r, -90 + i * 7), 'st' + i, 'cut', 0.5));
          return (
            <g key={i} transform={`translate(${x} ${sy}) scale(${s.toFixed(3)})`}>
              <Bit o={o} color={c} rim={false} />
            </g>
          );
        })}
      </g>
    </svg>
  );
};

export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background: 'radial-gradient(ellipse 85% 70% at 50% 46%, rgba(0,0,0,0) 60%, rgba(40,26,8,0.22) 100%)',
      pointerEvents: 'none',
    }}
  />
);
