// Text beats: every line is its own strip of paper, slid in by hand.
import React from 'react';
import {random, useCurrentFrame, useVideoConfig} from 'remotion';
import {FONT} from '../../shared/brand';
import {outlineRect, P, PaperSvg, Piece, place, Pose, textWidth} from './paper';
import {STAGGER, T} from './timing';

export type PaperKind = 'cream' | 'kraft' | 'green' | 'orange' | 'graph';
export type StripSpec = {text: string; paper: PaperKind; y: number; dx?: number; rot?: number; k?: number};
export type BeatSpec = {
  id: string;
  size: number;
  enter: number;
  exit: number;
  strips: StripSpec[];
  maxW?: number;
  exitDir?: 1 | -1;
  startDir?: 1 | -1;
};

const PAPERS: Record<PaperKind, {bg: string; ink: string; tex: string}> = {
  cream: {bg: P.cream, ink: P.ink, tex: 'hs-tex0'},
  kraft: {bg: P.kraftLight, ink: P.ink, tex: 'hs-kraft'},
  green: {bg: P.green, ink: P.cream, tex: 'hs-tex1'},
  orange: {bg: P.orange, ink: P.ink, tex: 'hs-tex2'},
  graph: {bg: P.paper, ink: P.ink, tex: 'hs-tex3'},
};

export const BEATS: BeatSpec[] = [
  {
    id: 'hook',
    size: 104,
    enter: T.hook.enter,
    exit: T.hook.exit,
    exitDir: -1,
    strips: [
      {text: 'Sırada ne', paper: 'cream', y: 500, dx: -60, rot: -1.6},
      {text: 'olduğunu bilmek', paper: 'cream', y: 648, dx: 10, rot: 1.0},
      {text: 'çocuğunuza', paper: 'cream', y: 796, dx: -36, rot: -0.9},
      {text: 'güven verir.', paper: 'orange', y: 955, dx: 40, rot: 1.8, k: 1.12},
    ],
  },
  {
    id: 'rutin',
    size: 94,
    enter: T.rutin.enter,
    exit: T.rutin.exit,
    exitDir: 1,
    startDir: 1,
    strips: [
      {text: 'Rutin,', paper: 'green', y: 392, dx: -170, rot: -2.4, k: 1.4},
      {text: 'katı bir program', paper: 'graph', y: 572, dx: 0, rot: 0.8},
      {text: 'değildir.', paper: 'cream', y: 708, dx: 110, rot: -1.3},
    ],
  },
  {
    id: 'cerceve',
    size: 86,
    enter: T.cerceve.enter,
    exit: T.cerceve.exit,
    exitDir: -1,
    maxW: 750,
    strips: [
      {text: 'Çocuğun', paper: 'cream', y: 562, dx: -120, rot: -1.2},
      {text: 'tanıyabileceği,', paper: 'cream', y: 688, dx: 0, rot: 0.9},
      {text: 'tekrar eden', paper: 'cream', y: 814, dx: -50, rot: -0.7},
      {text: 'bir çerçevedir.', paper: 'orange', y: 944, dx: 20, rot: 1.3},
    ],
  },
  {
    id: 'saat',
    size: 112,
    enter: T.saat.enter,
    exit: T.saat.exit,
    exitDir: 1,
    startDir: 1,
    strips: [
      {text: 'Her saati', paper: 'kraft', y: 380, dx: -90, rot: -1.5},
      {text: 'planlamanız', paper: 'cream', y: 538, dx: 20, rot: 1.1},
      {text: 'gerekmez.', paper: 'orange', y: 700, dx: 70, rot: -1.4},
    ],
  },
  {
    id: 'ana',
    size: 84,
    enter: T.ana.enter,
    exit: T.ana.exit,
    exitDir: -1,
    strips: [
      {text: 'Günün ana anları', paper: 'green', y: 540, dx: -30, rot: -1.3},
      {text: 'her gün', paper: 'cream', y: 664, dx: -170, rot: 1.2},
      {text: 'aşağı yukarı', paper: 'cream', y: 788, dx: 40, rot: -0.8},
      {text: 'aynı sırada olsun:', paper: 'orange', y: 914, dx: 10, rot: 1.0},
    ],
  },
  {
    id: 'weekend',
    size: 84,
    enter: T.weekend.enter,
    exit: T.weekend.exit,
    exitDir: 1,
    strips: [
      {text: 'Hafta sonları da', paper: 'green', y: 330, dx: -40, rot: -1.2},
      {text: 'bu iskeleti', paper: 'orange', y: 454, dx: 60, rot: 1.3},
      {text: 'mümkün olduğunca', paper: 'cream', y: 578, dx: -10, rot: -0.7},
      {text: 'koruyun.', paper: 'cream', y: 702, dx: 120, rot: 1.1},
    ],
  },
  {
    id: 'closing',
    size: 104,
    enter: T.closing.enter,
    exit: T.closing.exit,
    exitDir: -1,
    startDir: 1,
    strips: [
      {text: 'Düzenli bir gün,', paper: 'cream', y: 356, dx: -20, rot: -1.2},
      {text: 'öğrenmeye', paper: 'orange', y: 510, dx: 50, rot: 1.4, k: 1.1},
      {text: 'yer açar.', paper: 'cream', y: 666, dx: -60, rot: -0.9},
    ],
  },
];

const fontOf = (fs: number) => `650 ${fs.toFixed(1)}px ${FONT.heading}`;
const PADK = 0.62;
const stripW = (text: string, fs: number) => textWidth(text, fontOf(fs)) + fs * PADK;

/** shrink a beat's type size (uniformly) until its widest strip fits */
const fitSize = (b: BeatSpec) => {
  const maxW = b.maxW ?? 830;
  let ratio = 1;
  for (const s of b.strips) ratio = Math.max(ratio, stripW(s.text, b.size * (s.k ?? 1)) / maxW);
  return b.size / ratio;
};

export const Strip: React.FC<{s: StripSpec; size: number; pose: Pose; seed: string}> = ({s, size, pose, seed}) => {
  const pk = PAPERS[s.paper];
  const fs = size * (s.k ?? 1);
  const w = Math.round(stripW(s.text, fs));
  const h = Math.round(fs * 1.38);
  const ol = outlineRect(w, h, seed, ['cut', 'torn', 'cut', 'torn'], 1);
  const lim = 430 - w / 2;
  const dx = Math.max(-lim, Math.min(lim, s.dx ?? 0));
  return (
    <Piece x={510 + dx} y={s.y} w={w} h={h} pose={pose}>
      <PaperSvg w={w} h={h} o={ol} color={pk.bg} tex={pk.tex}>
        {s.paper === 'graph' && <path d={ol.d} fill="url(#hs-grid)" />}
      </PaperSvg>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: FONT.heading,
          fontWeight: 650,
          fontSize: fs,
          lineHeight: 1,
          color: pk.ink,
          whiteSpace: 'nowrap',
          paddingBottom: fs * 0.05,
        }}
      >
        {s.text}
      </div>
    </Piece>
  );
};

export const TextBeat: React.FC<{beat: BeatSpec}> = ({beat}) => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < beat.enter || frame > beat.exit + 40) return null;
  const size = fitSize(beat);
  const ex = beat.exitDir ?? -1;
  return (
    <>
      {beat.strips.map((s, i) => {
        const dir = (i % 2 === 0 ? -1 : 1) * (beat.startDir ?? 1);
        const pose = place(frame, fps, {
          seed: beat.id + i,
          enter: beat.enter + i * STAGGER,
          from: {x: dir * 1150, y: (random(beat.id + 'fy' + i) - 0.5) * 70, rot: dir * 7},
          rest: s.rot ?? 0,
          exit: beat.exit + i * 2,
          to: {x: ex * 1300, y: -50, rot: ex * 6},
          liftAmt: 0.55,
        });
        return <Strip key={i} s={s} size={size} pose={pose} seed={beat.id + 's' + i} />;
      })}
    </>
  );
};
