import React from 'react';
import {interpolate, interpolateColors, spring} from 'remotion';
import {getPointAtLength, getTangentAtLength} from '@remotion/paths';
import {C, FONT} from '../../shared/brand';
import * as T from './timeline';
import {
  branchLen,
  Cam,
  camSvg,
  DE_PATH,
  G_PATH,
  GHOST,
  LEN,
  LINE,
  RIVER_C,
  RIVER_PATH,
  spurGhost,
  spurPaint,
  SPUR_LEN,
  SPUR_TOP,
  ST,
  TR_PATH,
  trainDE,
  trainG,
  trainTR,
  Pt,
} from './map';

const CL = {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'} as const;
const LW = 34;
const sp = (f: number, start: number, dur = 14) =>
  spring({frame: f - start, fps: 30, config: {damping: 200}, durationInFrames: dur});
const popSpring = (f: number, start: number) =>
  spring({frame: f - start, fps: 30, config: {damping: 11, stiffness: 160, mass: 0.7}});

/** Line badge (roundel with letters) – SVG version. */
export const BadgeSvg: React.FC<{x: number; y: number; r: number; line: 'G' | 'TR' | 'DE'; s?: number}> = ({x, y, r, line, s = 1}) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={r} fill={LINE[line]} stroke="#fff" strokeWidth={r * 0.14} />
    <text
      y={r * 0.36}
      textAnchor="middle"
      fontFamily={FONT.geometric}
      fontWeight={700}
      fontSize={line === 'G' ? r * 1.05 : r * 0.82}
      fill={line === 'TR' ? C.greenDeep : '#FFFFFF'}
      letterSpacing={line === 'G' ? 0 : -1}
    >
      {line}
    </text>
  </g>
);

const Train: React.FC<{path: string; len: number; color: string; s?: number}> = ({path, len, color, s = 1}) => {
  const pt = getPointAtLength(path, len) ?? {x: 0, y: 0};
  const tg = getTangentAtLength(path, len) ?? {x: 0, y: 1};
  const ang = (Math.atan2(tg.y, tg.x) * 180) / Math.PI;
  return (
    <g transform={`translate(${pt.x} ${pt.y}) rotate(${ang}) scale(${s})`}>
      <rect x={-50} y={-25} width={104} height={54} rx={27} fill={C.greenDeep} opacity={0.14} />
      <rect x={-54} y={-29} width={108} height={58} rx={29} fill="#FFFFFF" stroke={C.greenDeep} strokeWidth={7} />
      <rect x={-38} y={-12} width={48} height={24} rx={12} fill={color} />
      <rect x={20} y={-16} width={22} height={32} rx={11} fill={C.greenDeep} />
    </g>
  );
};

/** Regular station: white dot with dark outline; ghost until the train arrives. */
const Station: React.FC<{pt: Pt; f: number; arrive: number; ghost: string; show?: number}> = ({pt, f, arrive, ghost, show = 1}) => {
  const stroke = interpolateColors(f, [arrive - 8, arrive - 2], [ghost, C.greenDeep]);
  const bump = interpolate(f, [arrive - 6, arrive + 10], [0, 1], CL);
  const s = (1 + 0.3 * Math.sin(Math.PI * bump)) * show;
  if (show <= 0.001) return null;
  return (
    <g transform={`translate(${pt.x} ${pt.y}) scale(${s})`}>
      <circle r={25} fill="#FFFFFF" stroke={stroke} strokeWidth={10} />
    </g>
  );
};

const Ripple: React.FC<{pt: Pt; f: number; at: number; color: string; big?: number}> = ({pt, f, at, color, big = 1}) => {
  if (f < at - 4 || f > at + 26) return null;
  const r = interpolate(f, [at - 4, at + 26], [34, 120], CL) * big;
  const o = interpolate(f, [at - 4, at + 26], [0.5, 0], CL);
  return <circle cx={pt.x} cy={pt.y} r={r} fill="none" stroke={color} strokeWidth={8} opacity={o} />;
};

const dash = (len: number, total: number) => `${Math.max(0, len)} ${total + 400}`;

export const MapSvg: React.FC<{f: number; cam: Cam}> = ({f, cam}) => {
  const gLen = trainG(f);
  const trLen = trainTR(f);
  const deLen = trainDE(f);
  const trGhost = branchLen(f, LEN.TR);
  const deGhost = branchLen(f, LEN.DE);
  const trainsPop = sp(f, T.TRAINS_POP, 16);
  const sGhost = spurGhost(f);
  const sPaint = spurPaint(f);
  const lineProps = {fill: 'none', strokeWidth: LW, strokeLinecap: 'round', strokeLinejoin: 'round'} as const;

  // spur dashes (straight vertical line, drawn manually so we can reveal + paint)
  const dashes: React.ReactNode[] = [];
  const DL = 30;
  const GAP = 22;
  for (let y = 0, i = 0; y < SPUR_LEN; y += DL + GAP, i++) {
    const y1 = Math.min(y + DL, SPUR_LEN);
    const vis = Math.min(y1, sGhost);
    if (vis <= y) continue;
    const painted = sPaint >= y1 - 4;
    dashes.push(
      <line
        key={i}
        x1={ST.X.x}
        x2={ST.X.x}
        y1={SPUR_TOP + y}
        y2={SPUR_TOP + vis}
        stroke={painted ? LINE.X : GHOST.X}
        strokeWidth={22}
        strokeLinecap="round"
      />,
    );
  }

  const appearAt = (ghostLen: number, l: number) => interpolate(ghostLen, [l - 30, l + 30], [0, 1], CL);
  const tBadge = popSpring(f, T.BRANCH0 + 16);
  const youHere = f < T.D0 + 10 ? ((f + 30) % 46) / 46 : -1;
  const xStroke = interpolateColors(f, [T.A3 - 8, T.A3 - 2], [GHOST.G, C.greenDeep]);
  const xBump = interpolate(f, [T.A3 - 6, T.A3 + 12], [0, 1], CL);
  const termShow = appearAt(trGhost, LEN.TR);
  const termStroke = interpolateColors(f, [T.A9 - 8, T.A9 - 2], [GHOST.G, C.greenDeep]);
  const termBump = interpolate(f, [T.A9 - 6, T.A9 + 14], [0, 1], CL);
  const spurEndShow = interpolate(sGhost, [SPUR_LEN - 10, SPUR_LEN], [0, 1], CL);
  const spurActive = interpolateColors(f, [T.A8 - 8, T.A8 - 2], [GHOST.X, LINE.X]);

  return (
    <svg width={1080} height={1920} style={{position: 'absolute', left: 0, top: 0}}>
      <defs>
        <pattern id="v03-dots" width={64} height={64} patternUnits="userSpaceOnUse">
          <circle cx={32} cy={32} r={3.4} fill="#DDE4E0" />
        </pattern>
      </defs>
      <g transform={camSvg(cam)}>
        <rect x={-3000} y={-2500} width={8500} height={11500} fill="url(#v03-dots)" />
        <path d={RIVER_PATH} fill="none" stroke={RIVER_C} strokeWidth={170} strokeLinecap="round" strokeLinejoin="round" />

        {/* ghost (planned) lines */}
        <path d={G_PATH} stroke={GHOST.G} {...lineProps} />
        <path d={TR_PATH} stroke={GHOST.TR} strokeDasharray={dash(trGhost, LEN.TR)} {...lineProps} />
        <path d={DE_PATH} stroke={GHOST.DE} strokeDasharray={dash(deGhost, LEN.DE)} {...lineProps} />
        {dashes}

        {/* painted (travelled) lines */}
        <path d={G_PATH} stroke={LINE.G} strokeDasharray={dash(gLen + 40, LEN.G)} {...lineProps} />
        <path d={TR_PATH} stroke={LINE.TR} strokeDasharray={dash(trainsPop * (trLen + 40), LEN.TR)} {...lineProps} />
        <path d={DE_PATH} stroke={LINE.DE} strokeDasharray={dash(trainsPop * (deLen + 40), LEN.DE)} {...lineProps} />

        {/* "you are here" pulse at the start */}
        {youHere >= 0 ? (
          <circle
            cx={ST.G0.x}
            cy={ST.G0.y + 84}
            r={60 + 70 * youHere}
            fill="none"
            stroke={C.orange}
            strokeWidth={8}
            opacity={0.45 * (1 - youHere) * interpolate(f, [T.D0 - 10, T.D0 + 10], [1, 0], CL)}
          />
        ) : null}

        {/* trains */}
        <Train path={G_PATH} len={gLen} color={C.orange} />
        {trainsPop > 0.001 ? <Train path={TR_PATH} len={trLen} color={LINE.TR} s={trainsPop} /> : null}
        {trainsPop > 0.001 ? <Train path={DE_PATH} len={deLen} color={LINE.DE} s={trainsPop} /> : null}

        {/* stations */}
        <BadgeSvg x={ST.G0.x} y={ST.G0.y} r={52} line="G" />
        <Station pt={ST.S1} f={f} arrive={T.A1} ghost={GHOST.G} />
        <Station pt={ST.S2} f={f} arrive={T.A2} ghost={GHOST.G} />
        <Station pt={ST.TR1} f={f} arrive={T.A4} ghost={GHOST.TR} show={appearAt(trGhost, LEN.TR1)} />
        <Station pt={ST.TR2} f={f} arrive={T.A5} ghost={GHOST.TR} show={appearAt(trGhost, LEN.TR2)} />
        <Station pt={ST.DE1} f={f} arrive={T.A6} ghost={GHOST.DE} show={appearAt(deGhost, LEN.DE1)} />
        <Station pt={ST.DE2} f={f} arrive={T.A7} ghost={GHOST.DE} show={appearAt(deGhost, LEN.DE2)} />

        {/* interchange ring */}
        <g transform={`translate(${ST.X.x} ${ST.X.y}) scale(${1 + 0.18 * Math.sin(Math.PI * xBump)})`}>
          <circle r={76} fill="#FFFFFF" stroke={xStroke} strokeWidth={16} />
          <circle r={40} fill="none" stroke={xStroke} strokeWidth={6} opacity={0.35} />
        </g>

        {/* spur terminus */}
        {spurEndShow > 0 ? (
          <g transform={`translate(${ST.SPUR.x} ${ST.SPUR.y}) scale(${spurEndShow * (1 + 0.3 * Math.sin(Math.PI * interpolate(f, [T.A8 - 6, T.A8 + 10], [0, 1], CL)))})`}>
            <circle r={28} fill="#FFFFFF" stroke={spurActive} strokeWidth={9} strokeDasharray="13 9" />
          </g>
        ) : null}

        {/* terminal (bullseye) */}
        {termShow > 0 ? (
          <g transform={`translate(${ST.TERM.x} ${ST.TERM.y}) scale(${termShow * (1 + 0.16 * Math.sin(Math.PI * termBump))})`}>
            <circle r={86} fill="#FFFFFF" stroke={termStroke} strokeWidth={17} />
            <circle r={36} fill={termStroke} />
            <circle r={13} fill={interpolateColors(f, [T.A9 - 2, T.A9 + 10], ['#FFFFFF', C.orange])} />
          </g>
        ) : null}

        {/* branch badges */}
        {tBadge > 0.001 ? (
          <>
            <BadgeSvg x={352} y={3462} r={46} line="TR" s={tBadge} />
            <BadgeSvg x={1028} y={3462} r={46} line="DE" s={tBadge} />
          </>
        ) : null}

        {/* arrival ripples */}
        <Ripple pt={ST.S1} f={f} at={T.A1} color={LINE.G} />
        <Ripple pt={ST.S2} f={f} at={T.A2} color={LINE.G} />
        <Ripple pt={ST.X} f={f} at={T.A3} color={LINE.G} big={1.5} />
        <Ripple pt={ST.TR1} f={f} at={T.A4} color={LINE.TR} />
        <Ripple pt={ST.TR2} f={f} at={T.A5} color={LINE.TR} />
        <Ripple pt={ST.DE1} f={f} at={T.A6} color={LINE.DE} />
        <Ripple pt={ST.DE2} f={f} at={T.A7} color={LINE.DE} />
        <Ripple pt={ST.SPUR} f={f} at={T.A8} color={LINE.X} />
        <Ripple pt={ST.TERM} f={f} at={T.A9} color={C.orange} big={1.7} />
      </g>
    </svg>
  );
};
