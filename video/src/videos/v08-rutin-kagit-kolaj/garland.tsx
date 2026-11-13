// The day's skeleton: three twine strings with six paper tags pegged on, one after another.
import React from 'react';
import {Easing, interpolate, spring, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '../../shared/brand';
import {
  arcPts,
  Bit,
  circlePts,
  crescentPts,
  lensPts,
  memo,
  OFF,
  outlineDense,
  outlinePoly,
  Outline,
  P,
  PaperSvg,
  Piece,
  place,
  polyPts,
  Pose,
  Pt,
  roundRectPts,
  starPts,
  stepF,
} from './paper';
import {T} from './timing';

const ROW_Y = [452, 784, 1116];
const SAG = 34;
const stringY = (row: number, x: number) => ROW_Y[row] + SAG * (1 - ((x - 540) / 640) ** 2);
const slopeDeg = (x: number) => (Math.atan((SAG * -2 * (x - 540)) / 640 ** 2) * 180) / Math.PI;
const TAG_H = 292;

type Icon = 'sun' | 'bowl' | 'bag' | 'blocks' | 'tub' | 'moon';
const TAGS: Array<{label: string; icon: Icon; row: number; x: number; w: number; paper: string; rot: number}> = [
  {label: 'Uyanma', icon: 'sun', row: 0, x: 300, w: 380, paper: P.cream, rot: -2.2},
  {label: 'Kahvaltı', icon: 'bowl', row: 0, x: 728, w: 380, paper: P.kraftLight, rot: 1.6},
  {label: 'Okul ya da ders', icon: 'bag', row: 1, x: 334, w: 470, paper: P.cream, rot: 1.2},
  {label: 'Oyun', icon: 'blocks', row: 1, x: 762, w: 320, paper: P.kraftLight, rot: -2.4},
  {label: 'Banyo', icon: 'tub', row: 2, x: 300, w: 380, paper: P.cream, rot: 2},
  {label: 'Uyku', icon: 'moon', row: 2, x: 728, w: 380, paper: P.kraftLight, rot: -1.6},
];

// ---------------------------------------------------------------- icons (180 x 150 box)
const o = (key: string, pts: Pt[], kind: 'cut' | 'torn' = 'cut', amp = 0.7): Outline => memo('ic:' + key, () => outlineDense(pts, key, kind, amp));
const rr = (key: string, x: number, y: number, w: number, h: number, r: number) => o(key, roundRectPts(x, y, w, h, r, 4));
const circ = (key: string, x: number, y: number, r: number) => o(key, circlePts(x, y, r, 4));

const IconSun = () => (
  <>
    {Array.from({length: 7}, (_, i) => {
      const a = ((-168 + i * 26) * Math.PI) / 180;
      const len = i % 2 === 0 ? 84 : 72;
      const c: Pt = [90, 116];
      const pt = (r: number, da: number): Pt => [c[0] + r * Math.cos(a + da), c[1] + r * Math.sin(a + da)];
      return <Bit key={i} o={o('sray' + i, polyPts([pt(54, -0.17), pt(len, 0), pt(54, 0.17)], 3))} color={i % 2 ? P.orangeLight : P.orange} rim={false} />;
    })}
    <Bit o={circ('sdisc', 90, 116, 46)} color={P.orange} />
    <Bit o={circ('sdisc2', 85, 110, 31)} color={P.orangeLight} rim={false} />
    <Bit
      o={o(
        'shill',
        polyPts([
          [-6, 124],
          [40, 112],
          [92, 120],
          [140, 108],
          [186, 118],
          [186, 154],
          [-6, 154],
        ]),
        'torn',
        0.7,
      )}
      color={P.greenMid}
    />
  </>
);

const IconBowl = () => (
  <>
    {[60, 90, 120].map((x, i) => (
      <path
        key={i}
        d={`M${x} 48 C ${x - 12} 36, ${x + 12} 26, ${x} 10`}
        stroke={P.paper}
        strokeWidth={7}
        strokeLinecap="round"
        fill="none"
        filter="url(#hs-pshadow)"
        opacity={i === 1 ? 1 : 0.92}
      />
    ))}
    <Bit o={circ('bf1', 60, 72, 17)} color={P.orange} />
    <Bit o={circ('bf2', 92, 66, 16)} color={P.orangeLight} />
    <Bit o={circ('bf3', 120, 72, 13)} color={P.paper} />
    <Bit o={o('bowl', polyPts([...arcPts(90, 78, 76, 62, 0, 180, 30)], 4))} color={P.green} tex />
    {[56, 90, 124].map((x, i) => (
      <Bit key={i} o={circ('bd' + i, x, i === 1 ? 118 : 108, 6)} color={P.paper} rim={false} shadow={false} />
    ))}
    <Bit o={rr('brim', 8, 70, 164, 16, 8)} color={P.paper} />
    <Bit o={rr('bfoot', 62, 134, 56, 12, 5)} color={P.greenMid} rim={false} />
  </>
);

const IconBag = () => (
  <>
    <path d="M70 34 C 68 6, 112 6, 110 34" stroke={P.kraftDark} strokeWidth={9} fill="none" strokeLinecap="round" filter="url(#hs-pshadow)" />
    <Bit o={rr('bagbody', 38, 26, 104, 122, 28)} color={P.orange} tex />
    <Bit o={rr('bagflap', 38, 26, 104, 56, 26)} color={P.green} />
    <Bit o={rr('bagbuck', 81, 68, 18, 20, 3)} color={P.kraftLight} rim={false} />
    <Bit o={rr('bagpock', 56, 98, 68, 40, 12)} color={P.paper} />
    <Bit o={rr('bagpf', 56, 98, 68, 13, 6)} color={P.orangeDeep} rim={false} />
  </>
);

const IconBlocks = () => (
  <>
    <Bit o={rr('blkA', 14, 92, 58, 56, 6)} color={P.green} tex />
    <Bit o={circ('blkAd', 43, 120, 12)} color={P.orange} rim={false} />
    <Bit o={rr('blkB', 76, 92, 58, 56, 6)} color={P.orange} tex />
    <Bit o={rr('blkBd', 92, 108, 26, 24, 4)} color={P.paper} rim={false} />
    <Bit
      o={o('blkC', polyPts([
        [74, 34],
        [106, 90],
        [42, 90],
      ], 4))}
      color={P.greenSoft}
    />
    <defs>
      <clipPath id="ballclip">
        <circle cx={154} cy={124} r={24} />
      </clipPath>
    </defs>
    <Bit o={circ('ball', 154, 124, 24)} color={P.paper} />
    <g clipPath="url(#ballclip)">
      <rect x={124} y={116} width={60} height={15} fill={P.orange} transform="rotate(-32 154 124)" />
    </g>
  </>
);

const IconTub = () => (
  <>
    <Bit o={circ('bub1', 32, 52, 13)} color={P.sageLight} />
    <Bit o={circ('bub2', 56, 36, 9)} color={P.sageLight} />
    <Bit o={circ('bub3', 30, 22, 7)} color={P.sageLight} />
    <Bit o={o('dbody', lensPts(112, 70, 40, 64, 90))} color={P.orange} />
    <Bit o={circ('dhead', 134, 46, 15)} color={P.orange} />
    <Bit
      o={o('dbeak', polyPts([
        [146, 42],
        [162, 49],
        [146, 55],
      ], 3))}
      color={P.orangeDeep}
      rim={false}
    />
    <circle cx={137} cy={42} r={2.8} fill={P.green} />
    <Bit o={o('dwing', lensPts(104, 66, 14, 30, 100))} color={P.orangeLight} rim={false} />
    <Bit o={o('tub', polyPts([[12, 78], [168, 78], ...arcPts(138, 106, 30, 30, 0, 90, 10), ...arcPts(42, 106, 30, 30, 90, 180, 10)], 4))} color={P.greenMid} tex />
    <Bit o={rr('tubrim', 6, 72, 168, 14, 7)} color={P.paper} />
    <Bit o={rr('tubf1', 34, 132, 18, 13, 5)} color={P.kraftDark} rim={false} />
    <Bit o={rr('tubf2', 128, 132, 18, 13, 5)} color={P.kraftDark} rim={false} />
  </>
);

const IconMoon = () => (
  <>
    <Bit o={circ('night', 90, 76, 68)} color={P.green} tex />
    <Bit o={o('mcres', crescentPts(84, 80, 44, -28))} color={P.moon} />
    <Bit o={o('mst1', starPts(130, 44, 11))} color={P.orange} rim={false} />
    <Bit o={o('mst2', starPts(136, 96, 7))} color={P.orangeLight} rim={false} />
    <Bit o={o('mst3', starPts(56, 34, 6))} color={P.moon} rim={false} />
  </>
);

const ICONS: Record<Icon, React.FC> = {sun: IconSun, bowl: IconBowl, bag: IconBag, blocks: IconBlocks, tub: IconTub, moon: IconMoon};

// ---------------------------------------------------------------- tag + peg
const tagOutline = (w: number, seed: string) =>
  memo('tag' + seed + w, () =>
    outlinePoly(
      [
        [22, 0],
        [w - 22, 0],
        [w, 22],
        [w, TAG_H],
        [0, TAG_H],
        [0, 22],
      ],
      ['cut'],
      seed,
      1,
    ),
  );

const Tag: React.FC<{i: number; pose: Pose; dx: number}> = ({i, pose, dx}) => {
  const t = TAGS[i];
  const top = stringY(t.row, t.x) - 12;
  const IconC = ICONS[t.icon];
  return (
    <Piece x={t.x + dx} y={top + TAG_H / 2} w={t.w} h={TAG_H} pose={pose} origin="50% 4%">
      <PaperSvg w={t.w} h={TAG_H} o={tagOutline(t.w, 'tg' + i)} color={t.paper} tex={t.paper === P.kraftLight ? 'hs-kraft' : 'hs-tex0'}>
        <g transform={`translate(${t.w / 2 - 90} 38)`}>
          <IconC />
        </g>
      </PaperSvg>
      <div
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          top: 202,
          height: 66,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT.rounded,
          fontWeight: 900,
          fontSize: 52,
          lineHeight: 1,
          color: P.ink,
          whiteSpace: 'nowrap',
        }}
      >
        {t.label}
      </div>
    </Piece>
  );
};

const PEG_W = 30;
const PEG_H = 80;
const Peg: React.FC<{i: number; pose: Pose; dx: number}> = ({i, pose, dx}) => {
  const t = TAGS[i];
  const y = stringY(t.row, t.x) + 8;
  const back = memo('pegb', () => outlineDense(roundRectPts(2, 0, 26, 80, 7, 4), 'pegb', 'cut', 0.5));
  const front = memo('pegf', () => outlineDense(roundRectPts(5, 2, 20, 74, 6, 4), 'pegf', 'cut', 0.5));
  return (
    <Piece x={t.x + dx} y={y} w={PEG_W} h={PEG_H} pose={pose}>
      <svg width={PEG_W} height={PEG_H} style={{position: 'absolute', overflow: 'visible'}}>
        <path d={back.d} fill={P.kraft} />
        <path d={front.d} fill={P.kraftLight} />
        <path d={front.d} fill="url(#hs-kraft)" opacity={0.6} />
        <rect x={3} y={30} width={24} height={7} rx={2} fill="#7E8A86" />
      </svg>
    </Piece>
  );
};

const tagPose = (frame: number, fps: number, enter: number, i: number): Pose => {
  const f = stepF(frame);
  if (f < enter) return OFF;
  const t = f - enter;
  const p = spring({frame: t, fps, config: {damping: 14, stiffness: 120, mass: 0.9}});
  const dir = i % 2 === 0 ? 1 : -1;
  const swing = dir * 10 * Math.exp(-t / 11) * Math.cos(t * 0.38);
  const lift = Math.max(0, 1 - p * 1.1);
  const tag = TAGS[i];
  return {on: true, x: 0, y: -340 * (1 - p), rot: slopeDeg(tag.x) + tag.rot + swing, scale: 1 + 0.04 * lift, lift};
};

// ---------------------------------------------------------------- strings
const stringPath = (row: number) => {
  const pts: string[] = [];
  for (let x = -760; x <= 1840; x += 20) pts.push(`${x} ${stringY(row, x).toFixed(1)}`);
  return 'M' + pts.join('L');
};

const Strings: React.FC<{frame: number; drop: number}> = ({frame, drop}) => {
  const f = stepF(frame);
  return (
    <svg width={1080} height={1920} style={{position: 'absolute', inset: 0, overflow: 'visible'}}>
      {[0, 1, 2].map((row) => {
        const st = T.anchors.strings + row * 5;
        if (f < st) return null;
        const p = interpolate(f - st, [0, 14], [0, 1], {extrapolateRight: 'clamp', easing: Easing.inOut(Easing.cubic)});
        const id = 'twclip' + row;
        const d = stringPath(row);
        return (
          <g key={row} transform={`translate(0 ${drop.toFixed(1)})`}>
            <defs>
              <clipPath id={id}>
                <rect x={-800} y={-2000} width={p >= 1 ? 4000 : 700 + 1300 * p} height={6000} />
              </clipPath>
            </defs>
            <g clipPath={`url(#${id})`} filter="url(#hs-pshadow)">
              <path d={d} stroke={P.kraftDark} strokeWidth={5.5} fill="none" />
              <path d={d} stroke="#D7BC8C" strokeWidth={2.4} strokeDasharray="7 8" fill="none" />
            </g>
          </g>
        );
      })}
    </svg>
  );
};

// ---------------------------------------------------------------- the whole garland
export const Garland: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  const f = stepF(frame);
  if (f < T.anchors.strings) return null;
  if (f > T.outro.garlandOut + 30) return null;
  // camera pull-back for the weekend beat
  const pull = f >= T.weekend.pull ? spring({frame: f - T.weekend.pull, fps, config: {damping: 18, stiffness: 80, mass: 1}}) : 0;
  const scale = 1 - 0.42 * pull;
  const ty = 410 * pull;
  // tags slide apart ("yer açar"), then off to the sides for the outro
  const part = f >= T.closing.part ? spring({frame: f - T.closing.part, fps, config: {damping: 15, stiffness: 90, mass: 1}}) : 0;
  const out = interpolate(f, [T.outro.garlandOut, T.outro.garlandOut + 14], [0, 1], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });
  const drop = interpolate(f, [T.outro.garlandOut + 6, T.outro.garlandOut + 22], [0, 1600], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: Easing.in(Easing.cubic),
  });
  return (
    <div style={{position: 'absolute', inset: 0, transform: `translate(0px, ${ty.toFixed(1)}px) scale(${scale.toFixed(4)})`, transformOrigin: '510px 452px'}}>
      <Strings frame={frame} drop={drop} />
      {TAGS.map((t, i) => {
        const enter = T.anchors.tags[i];
        const side = t.x < 540 ? -1 : 1;
        const dx = side * (150 * part + 1500 * out);
        const tp = tagPose(frame, fps, enter, i);
        const pp = place(frame, fps, {seed: 'peg' + i, enter: enter + 8, from: {y: -70, rot: 10}, rest: slopeDeg(t.x) * 0.5});
        return (
          <React.Fragment key={i}>
            <Tag i={i} pose={tp} dx={dx} />
            <Peg i={i} pose={pp} dx={dx} />
          </React.Fragment>
        );
      })}
    </div>
  );
};

