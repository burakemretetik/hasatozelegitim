import React, {useEffect, useMemo, useState} from 'react';
import {AbsoluteFill, Easing, continueRender, delayRender, interpolate, useCurrentFrame} from 'remotion';
import {getPointAtLength} from '@remotion/paths';
import {measureText} from '@remotion/layout-utils';
import {C, FONT, HasatLogo} from '../../shared/brand';
import {fontsReady} from '../../shared/fonts';
import {BOARD, INK, ghostScribbles} from './doodles';
import {P, line} from './rough';
import {COVER, Cam, ITEMS, Item, LogoItem, SPACES, SpaceId, StrokeItem, TOTAL, TextItem, cameraAt, toCanvas} from './script';

export const meta = {
  id: 'v07',
  durationInFrames: TOTAL,
  coverFrame: COVER,
};

const W = 1080;
const H = 1920;

// ---------- resolve text metrics (after fonts are loaded) ----------
type RText = TextItem & {x0: number; w: number; fs: number};
type RItem = StrokeItem | RText | LogoItem;

const measure = (text: string, size: number, weight: number) =>
  measureText({text, fontFamily: FONT.hand, fontSize: size, fontWeight: weight}).width;

const resolveItems = (): RItem[] => {
  const texts = new Map<string, RText>();
  const out: RItem[] = [];
  for (const it of ITEMS) {
    if (it.kind === 'text') {
      let fs = it.size;
      let w = measure(it.text, fs, it.weight);
      if (w > it.maxW) {
        fs = (fs * it.maxW) / w;
        w = measure(it.text, fs, it.weight);
      }
      const x0 = it.anchor === 'middle' ? it.x - w / 2 : it.x;
      const r: RText = {...it, fs, w, x0};
      texts.set(it.id, r);
      out.push(r);
    } else if (it.kind === 'hl') {
      const t = texts.get(it.of);
      if (!t) continue;
      const idx = t.text.indexOf(it.sub);
      const pre = idx > 0 ? measure(t.text.slice(0, idx), t.fs, t.weight) : 0;
      const sw = measure(it.sub, t.fs, t.weight);
      const xa = t.x0 + pre - t.fs * 0.06;
      const xb = t.x0 + pre + sw + t.fs * 0.04;
      const marker = it.style === 'marker';
      const y = marker ? t.y - t.fs * 0.2 : t.y + t.fs * 0.16;
      const d = line([xa, y + 2], [xb, y - 3], it.of + it.sub, marker ? 0.01 : 0.03);
      out.push({
        kind: 'stroke',
        d,
        len: xb - xa + 6,
        w: marker ? t.fs * 0.42 : 7,
        c: it.c,
        o: marker ? 0.5 : 1,
        under: marker,
        cap: marker ? 'butt' : 'round',
        blend: marker,
        space: it.space,
        start: it.start,
        dur: it.dur,
        pen: false,
      });
    } else {
      out.push(it);
    }
  }
  return out;
};

// ---------- progress ----------
const drawEase = Easing.bezier(0.42, 0, 0.58, 1);
const writeEase = Easing.bezier(0.25, 0.1, 0.75, 0.95);
const progress = (f: number, it: {start: number; dur: number}, e = drawEase) =>
  e(interpolate(f, [it.start, it.start + it.dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}));

// ---------- rendering of board items ----------
const StrokeEl: React.FC<{it: StrokeItem; f: number}> = ({it, f}) => {
  const p = progress(f, it, it.blend ? Easing.out(Easing.cubic) : drawEase);
  if (p <= 0) return null;
  const len = it.len + 2;
  const fillO = it.fill ? interpolate(p, [0.6, 1], [0, 0.9], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}) : 0;
  return (
    <path
      d={it.d}
      fill={it.fill ?? 'none'}
      fillOpacity={fillO}
      stroke={it.c}
      strokeOpacity={it.o}
      strokeWidth={it.w}
      strokeLinecap={it.cap ?? 'round'}
      strokeLinejoin="round"
      strokeDasharray={`${len} ${len}`}
      strokeDashoffset={len * (1 - p)}
      style={it.blend ? {mixBlendMode: 'multiply'} : undefined}
    />
  );
};

const TextEl: React.FC<{it: RText; f: number; idx: number}> = ({it, f, idx}) => {
  const p = progress(f, it, writeEase);
  if (p <= 0) return null;
  const common = {
    x: it.x0,
    y: it.y,
    fontFamily: FONT.hand,
    fontSize: it.fs,
    fontWeight: it.weight,
    fill: it.c,
  };
  if (p >= 1) return <text {...common}>{it.text}</text>;
  const F = it.fs * 0.35;
  const edge = it.x0 + p * (it.w + F);
  const mid = `v07m${idx}`;
  const gid = `v07g${idx}`;
  const box = {x: it.x0 - 40, y: it.y - it.fs * 1.3, width: it.w + 80, height: it.fs * 2};
  return (
    <g>
      <defs>
        <linearGradient id={gid} gradientUnits="userSpaceOnUse" x1={edge - F} y1={0} x2={edge} y2={0}>
          <stop offset="0" stopColor="#fff" />
          <stop offset="1" stopColor="#000" />
        </linearGradient>
        <mask id={mid} maskUnits="userSpaceOnUse" {...box}>
          <rect {...box} fill={`url(#${gid})`} />
        </mask>
      </defs>
      <text {...common} mask={`url(#${mid})`}>
        {it.text}
      </text>
    </g>
  );
};

const SPACE_IDS = Object.keys(SPACES) as SpaceId[];
const GHOSTS = ghostScribbles();

const Board: React.FC<{items: RItem[]; f: number; cam: Cam}> = ({items, f, cam}) => (
  <g transform={`translate(${W / 2} ${H / 2}) scale(${cam.z}) translate(${-cam.x} ${-cam.y})`}>
    {GHOSTS.map((g, i) => (
      <path key={i} d={g.d} fill="none" stroke={INK} strokeOpacity={g.o} strokeWidth={g.w} strokeLinecap="round" />
    ))}
    {SPACE_IDS.map((sp) => {
      const S = SPACES[sp];
      return (
        <g key={sp} transform={`translate(${S.ox} ${S.oy}) scale(${S.s})`}>
          {items.map((it, i) =>
            it.space === sp && it.kind === 'stroke' && it.under ? <StrokeEl key={i} it={it} f={f} /> : null,
          )}
          {items.map((it, i) => {
            if (it.space !== sp) return null;
            if (it.kind === 'stroke') return it.under ? null : <StrokeEl key={i} it={it} f={f} />;
            if (it.kind === 'text') return <TextEl key={i} it={it} f={f} idx={i} />;
            return null;
          })}
        </g>
      );
    })}
  </g>
);

// ---------- marker pen that follows the stroke tip ----------
type PenSeg = {it: RItem; start: number; end: number};
const toScreen = (cam: Cam, p: P): P => [(p[0] - cam.x) * cam.z + W / 2, (p[1] - cam.y) * cam.z + H / 2];

const tipLocal = (it: RItem, p: number, f: number): P => {
  if (it.kind === 'stroke') {
    const q = getPointAtLength(it.d, Math.max(0, Math.min(it.len, it.len * p)));
    return q ? [q.x, q.y] : [0, 0];
  }
  if (it.kind === 'text') {
    const s = it.fs;
    return [it.x0 + it.w * p + Math.sin(f * 1.7) * 0.03 * s, it.y - 0.3 * s + Math.sin(f * 2.3) * 0.17 * s + Math.sin(f * 3.9 + 1) * 0.07 * s];
  }
  return [it.x - it.w / 2 + it.w * p, it.y + Math.sin(f * 1.9) * it.w * 0.1];
};
const tipScreen = (it: RItem, p: number, f: number, cam: Cam): P => toScreen(cam, toCanvas(it.space, tipLocal(it, p, f)));

const REST: P = [1260, 2250];
const HOP = 14;

const penState = (segs: PenSeg[], f: number, cam: Cam): {pos: P; lift: number} | null => {
  let active: PenSeg | null = null;
  let prev: PenSeg | null = null;
  let next: PenSeg | null = null;
  for (const s of segs) {
    if (s.start <= f && f < s.end) active = s;
    if (s.end <= f && (!prev || s.end > prev.end)) prev = s;
    if (s.start > f && (!next || s.start < next.start)) next = s;
  }
  if (active) {
    const it = active.it;
    const p = progress(f, it, it.kind === 'text' ? writeEase : drawEase);
    return {pos: tipScreen(it, p, f, cam), lift: 0};
  }
  const e = Easing.inOut(Easing.quad);
  if (prev && next && next.start - prev.end <= HOP) {
    const t = (f - prev.end) / Math.max(1, next.start - prev.end);
    const a = tipScreen(prev.it, 1, f, cam);
    const b = tipScreen(next.it, 0, f, cam);
    const k = e(t);
    return {pos: [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k], lift: Math.sin(Math.PI * t)};
  }
  if (prev && f - prev.end < HOP) {
    const t = (f - prev.end) / HOP;
    const a = tipScreen(prev.it, 1, f, cam);
    const k = Easing.in(Easing.quad)(t);
    return {pos: [a[0] + (REST[0] - a[0]) * k, a[1] + (REST[1] - a[1]) * k], lift: Math.min(1, t * 2)};
  }
  if (next && next.start - f <= HOP) {
    const t = 1 - (next.start - f) / HOP;
    const b = tipScreen(next.it, 0, f, cam);
    const k = Easing.out(Easing.quad)(t);
    return {pos: [REST[0] + (b[0] - REST[0]) * k, REST[1] + (b[1] - REST[1]) * k], lift: Math.min(1, (1 - t) * 2)};
  }
  return null;
};

const Pen: React.FC<{pos: P; lift: number}> = ({pos, lift}) => {
  const sh = 14 + lift * 22;
  const body = (
    <>
      <path d="M0 -4 L18 -10 L18 10 L0 4 Z" fill={INK} />
      <path d="M18 -10 L46 -23 L46 23 L18 10 Z" fill="#E4E9E5" stroke="#C3CDC8" strokeWidth={1.5} />
      <rect x={44} y={-25} width={214} height={50} rx={7} fill="#FBFBF8" stroke="#C9D3CE" strokeWidth={1.5} />
      <rect x={44} y={6} width={214} height={19} rx={6} fill="#E7ECE8" />
      <rect x={118} y={-25} width={58} height={50} fill={C.orange} />
      <rect x={252} y={-28} width={84} height={56} rx={12} fill={INK} />
      <rect x={258} y={-28} width={10} height={56} fill="#24493F" />
    </>
  );
  return (
    <g transform={`translate(${pos[0]} ${pos[1]})`}>
      <g transform={`translate(${sh} ${sh * 1.25}) rotate(-58)`} opacity={0.13}>
        <rect x={0} y={-22} width={330} height={44} rx={22} fill="#0B201C" filter="url(#v07blur)" />
      </g>
      <g transform={`rotate(-58) scale(${1 + lift * 0.04})`}>{body}</g>
    </g>
  );
};

// ---------- logo (official artwork, revealed as if drawn) ----------
const Logo: React.FC<{it: LogoItem; f: number; cam: Cam}> = ({it, f, cam}) => {
  const p = progress(f, it, writeEase);
  const S = SPACES[it.space];
  const w = it.w * S.s * cam.z;
  const h = w / 2.05;
  const [cx, cy] = toScreen(cam, toCanvas(it.space, [it.x, it.y]));
  const pct = -12 + p * 124;
  const mask = `linear-gradient(90deg, #000 ${pct}%, transparent ${pct + 12}%)`;
  return (
    <div
      style={{
        position: 'absolute',
        left: cx - w / 2,
        top: cy - h / 2,
        width: w,
        WebkitMaskImage: mask,
        maskImage: mask,
        opacity: p > 0 ? 1 : 0,
      }}
    >
      <HasatLogo width={w} />
    </div>
  );
};

let RESOLVED: RItem[] | null = null;

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const items = useMemo(() => {
    if (!RESOLVED) RESOLVED = resolveItems();
    return RESOLVED;
  }, []);
  const segs = useMemo<PenSeg[]>(
    () => items.filter((it) => it.pen).map((it) => ({it, start: it.start, end: it.start + it.dur})),
    [items],
  );
  const cam = cameraAt(f);
  const pen = penState(segs, f, cam);
  const logo = items.find((it): it is LogoItem => it.kind === 'logo');
  return (
    <AbsoluteFill style={{background: BOARD}}>
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
        <defs>
          <filter id="v07grain" x="0" y="0" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={7} stitchTiles="stitch" />
            <feColorMatrix values="0 0 0 0 0.07  0 0 0 0 0.19  0 0 0 0 0.17  0.5 0 0 0 -0.12" />
          </filter>
          <radialGradient id="v07vig" cx="50%" cy="46%" r="75%">
            <stop offset="0.55" stopColor="#12312B" stopOpacity={0} />
            <stop offset="1" stopColor="#12312B" stopOpacity={0.09} />
          </radialGradient>
          <filter id="v07blur" x="-20%" y="-50%" width="140%" height="200%">
            <feGaussianBlur stdDeviation={7} />
          </filter>
        </defs>
        <rect width={W} height={H} filter="url(#v07grain)" opacity={0.5} />
        <Board items={items} f={f} cam={cam} />
        <rect width={W} height={H} fill="url(#v07vig)" />
      </svg>
      {logo ? <Logo it={logo} f={f} cam={cam} /> : null}
      {pen ? (
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{position: 'absolute', inset: 0}}>
          <Pen pos={pen.pos} lift={pen.lift} />
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};

export const Video: React.FC = () => {
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('v07: fonts'));
  useEffect(() => {
    fontsReady
      .then(() => document.fonts.ready)
      .then(() => {
        setReady(true);
        continueRender(handle);
      });
  }, [handle]);
  if (!ready) return <AbsoluteFill style={{background: BOARD}} />;
  return <Scene />;
};
