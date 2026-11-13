// v08 — Günün iskeletini kurun · Paper cut-out collage (stop-motion feel)
import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender, useCurrentFrame, useVideoConfig} from 'remotion';
import {HasatLogo} from '../../shared/brand';
import {fontsReady} from '../../shared/fonts';
import {Defs, outlineRect, P, PaperSvg, Piece, place, Tape, TEX_URIS} from './paper';
import {Clouds, DuskSheet, FarHill, NearHills, Sky, SunMoon, Vellum, Vignette} from './scene';
import {CerceveFrame, Clock, GraphCard, WheatField} from './objects';
import {Garland} from './garland';
import {BEATS, Strip, TextBeat} from './text';
import {DURATION, T} from './timing';

export const meta = {
  id: 'v08',
  durationInFrames: DURATION,
  coverFrame: 96,
};

/** wait for fonts (text is measured on canvas) and the paper texture tiles */
const useAssetsReady = () => {
  const [ready, setReady] = useState(false);
  const [handle] = useState(() => delayRender('v08: fonts + paper textures'));
  useEffect(() => {
    const imgs = TEX_URIS.map(
      (src) =>
        new Promise<void>((res) => {
          const im = new Image();
          im.onload = () => res();
          im.onerror = () => res();
          im.src = src;
        }),
    );
    Promise.all([
      fontsReady,
      document.fonts.load(`650 100px 'Bricolage Grotesque'`),
      document.fonts.load(`900 52px 'Nunito'`),
      ...imgs,
    ])
      .then(() => document.fonts.ready)
      .then(() => setReady(true));
  }, []);
  useEffect(() => {
    if (ready) continueRender(handle);
  }, [ready, handle]);
  return ready;
};

const CARD_W = 760;
const CARD_H = 410;

const Outro: React.FC = () => {
  const frame = useCurrentFrame();
  const {fps} = useVideoConfig();
  if (frame < T.outro.card) return null;
  const card = place(frame, fps, {
    seed: 'card',
    enter: T.outro.card,
    from: {y: -1300, rot: -9},
    rest: -1.2,
    config: {damping: 16, stiffness: 120, mass: 1},
  });
  const strip = place(frame, fps, {
    seed: 'ostrip',
    enter: T.outro.strip,
    from: {x: 1150, y: 20, rot: 7},
    rest: 1.4,
    liftAmt: 0.55,
  });
  const tapes = frame >= T.outro.card + 14;
  return (
    <>
      <Piece x={510} y={610} w={CARD_W} h={CARD_H} pose={card}>
        <PaperSvg w={CARD_W} h={CARD_H} o={outlineRect(CARD_W, CARD_H, 'outro-card', ['cut'], 1)} color={P.paper} tex="hs-tex0" />
        <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
          <HasatLogo width={590} />
        </div>
        {tapes && (
          <>
            <Tape x={18} y={14} rot={-38} seed="tape1" />
            <Tape x={CARD_W - 16} y={16} rot={36} seed="tape2" />
          </>
        )}
      </Piece>
      <Strip s={{text: 'Yazının tamamı blogumuzda.', paper: 'kraft', y: 872, dx: 0, rot: 1.4}} size={58} pose={strip} seed="outro-strip" />
    </>
  );
};

export const Video: React.FC = () => {
  const ready = useAssetsReady();
  return (
    <AbsoluteFill style={{background: P.sky, overflow: 'hidden'}}>
      <Defs />
      {ready && (
        <>
          <Sky />
          <DuskSheet />
          <SunMoon layer="low" />
          <Clouds />
          <FarHill />
          {/* props rise from behind the hills, like a paper theatre */}
          <GraphCard />
          <Clock />
          <WheatField />
          <NearHills />
          <Vellum />
          <SunMoon layer="high" />
          <Garland />
          {BEATS.map((b) => (
            <TextBeat key={b.id} beat={b} />
          ))}
          <CerceveFrame top={450} bottom={1054} />
          <Outro />
          <Vignette />
        </>
      )}
    </AbsoluteFill>
  );
};
