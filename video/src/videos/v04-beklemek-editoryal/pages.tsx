import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame} from 'remotion';
import {Basak, C, FONT, HasatLogo} from '../../shared/brand';
import {
  ACCENT,
  ACCENT_INK,
  COL,
  COL_W,
  EASE_INOUT,
  EASE_OUT,
  Grain,
  HAIR,
  HandCircle,
  HandUnderline,
  INK,
  INK2,
  Paper,
  Rise,
  Rule,
  serif,
  tween,
} from './kit';
import {Hourglass, Seedling} from './spots';
import {EXIT_STAGGER, STAGGER, T, TURN} from './timing';

// ───────────────────────────────── page furniture ─────────────────────────────────

const KICKER = 'AİLELER İÇİN · OTİZM';

/** Small running head (pages 2–3): section label + hairline. Decorative. */
const RunningHead: React.FC = () => (
  <div style={{position: 'absolute', left: COL.left, top: 244, width: COL_W}}>
    <div
      style={{
        ...serif(14),
        fontSize: 27,
        fontWeight: 560,
        letterSpacing: '0.24em',
        color: INK2,
        opacity: 0.85,
        whiteSpace: 'nowrap',
      }}
    >
      {KICKER}
    </div>
    <div style={{marginTop: 18, height: 2, background: HAIR}} />
  </div>
);

/** Folio at the foot of the page: hairline, magazine name, page number. Decorative. */
const Folio: React.FC<{n: number}> = ({n}) => (
  <div style={{position: 'absolute', left: COL.left, top: 1446, width: COL_W}}>
    <div style={{height: 2, background: HAIR}} />
    <div
      style={{
        marginTop: 14,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        color: INK2,
        opacity: 0.85,
      }}
    >
      <span style={{...serif(14), fontStyle: 'italic', fontSize: 30}}>Hasat</span>
      <span style={{...serif(14), fontSize: 30, fontWeight: 500, letterSpacing: '0.08em', fontVariantNumeric: 'oldstyle-nums'}}>
        {n}
      </span>
    </div>
  </div>
);

/** Slow camera drift over the page; furniture moves less than type (parallax). */
const useDrift = (from: number, to: number, amount: number) => {
  const f = useCurrentFrame();
  return interpolate(f, [from, to], [amount / 2, -amount / 2], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
};

const Page: React.FC<{
  folio: number;
  seed: number;
  head?: boolean;
  span: [number, number];
  children: React.ReactNode;
}> = ({folio, seed, head = true, span, children}) => {
  const typeDrift = useDrift(span[0], span[1], 26);
  const furnDrift = useDrift(span[0], span[1], 10);
  return (
    <AbsoluteFill style={{overflow: 'hidden'}}>
      <Paper seed={seed} />
      <AbsoluteFill style={{transform: `translateY(${furnDrift.toFixed(2)}px)`}}>
        {head ? <RunningHead /> : null}
        <Folio n={folio} />
      </AbsoluteFill>
      <AbsoluteFill style={{transform: `translateY(${typeDrift.toFixed(2)}px)`}}>{children}</AbsoluteFill>
      <Grain seed={seed + 5} />
    </AbsoluteFill>
  );
};

/** Places a column block at an absolute y inside the text column. */
const Block: React.FC<{top: number; children: React.ReactNode; style?: React.CSSProperties}> = ({top, children, style}) => (
  <div style={{position: 'absolute', left: COL.left, top, width: COL_W, ...style}}>{children}</div>
);

// ──────────────────────────────── type styles ─────────────────────────────────

const quoteStyle: React.CSSProperties = {
  ...serif(96, 0),
  fontStyle: 'italic',
  fontWeight: 400,
  color: INK,
};
const romanStyle: React.CSSProperties = {...serif(60, 0), fontWeight: 400, color: INK};

// ───────────────────────────────── PAGE 1 ─────────────────────────────────────
// Kicker + hook pull quote with hanging punctuation + caption.

export const Page1: React.FC = () => {
  const f = useCurrentFrame();
  const kick = tween(f, T.kicker, T.kicker + 26, EASE_OUT);
  const Q = 128;
  const QLH = 142;
  const qLines: React.ReactNode[] = [
    <>
      <span style={{position: 'absolute', right: '100%', color: ACCENT, marginRight: 4}}>“</span>Biraz daha
    </>,
    <>bekleyelim, belki</>,
    <>kendiliğinden</>,
    <>düzelir.”</>,
  ];
  return (
    <Page folio={12} seed={3} head={false} span={[0, T.turn1 + TURN]}>
      {/* kicker + double rule */}
      <Block top={258}>
        <div
          style={{
            ...serif(24),
            fontSize: 46,
            fontWeight: 600,
            letterSpacing: '0.14em',
            color: ACCENT_INK,
            whiteSpace: 'nowrap',
            opacity: interpolate(kick, [0, 0.6], [0, 1], {extrapolateRight: 'clamp'}),
            transform: `translateY(${((1 - kick) * 18).toFixed(2)}px)`,
          }}
        >
          {KICKER}
        </div>
        <Rule at={T.kicker + 4} width={COL_W} thick={5} color={INK} dur={34} style={{marginTop: 22}} />
        <Rule at={T.kicker + 10} width={COL_W} thick={2} color={INK} dur={34} style={{marginTop: 7}} />
      </Block>

      {/* the pull quote */}
      <Block top={500}>
        <div style={{...quoteStyle, fontSize: Q}}>
          {qLines.map((l, i) => (
            <Rise key={i} at={T.quote + i * 5} lh={QLH} padTop={30} padBottom={34}>
              <span style={{position: 'relative'}}>{l}</span>
            </Rise>
          ))}
        </div>
      </Block>

      {/* caption */}
      <Block top={1124}>
        <Rule at={T.capRule} width={110} thick={3} color={ACCENT} dur={22} />
        <div style={{...romanStyle, fontSize: 52, color: INK2, marginTop: 32}}>
          <Rise at={T.caption} lh={70}>Ailelerden en sık duyduğumuz</Rise>
          <Rise at={T.caption + STAGGER} lh={70}>cümlelerden biri.</Rise>
        </div>
      </Block>
    </Page>
  );
};

// ───────────────────────────────── PAGE 2 ─────────────────────────────────────

export const Page2: React.FC = () => {
  const out = T.p2Out;
  return (
    <Page folio={13} seed={8} span={[T.turn1, T.turn2 + TURN]}>
      {/* b3 – the concession */}
      <Block top={418}>
        <div style={{...romanStyle, fontSize: 76, color: INK2}}>
          <Rise at={T.b3} out={out} lh={96}>Kimi zaman gerçekten</Rise>
          <Rise at={T.b3 + STAGGER} out={out + EXIT_STAGGER} lh={96}>öyle olur.</Rise>
        </div>
      </Block>

      {/* b4 – the turn, underlined */}
      <Block top={676}>
        <div style={{...quoteStyle, fontSize: 128}}>
          <Rise at={T.b4} out={out + 2 * EXIT_STAGGER} lh={140}>Ama beklerken</Rise>
          <Rise at={T.b4 + STAGGER} out={out + 3 * EXIT_STAGGER} lh={140}>geçen aylar</Rise>
          <Rise at={T.b4 + 2 * STAGGER} out={out + 4 * EXIT_STAGGER} lh={140} padBottom={60}>
            <span style={{position: 'relative', display: 'inline-block'}}>
              geri gelmez.
              <HandUnderline at={T.underline} />
            </span>
          </Rise>
        </div>
      </Block>

      {/* spot: hourglass */}
      <div style={{position: 'absolute', left: 738, top: 1158}}>
        <Hourglass at={T.hourglass} out={out + 4} size={258} />
      </div>

      {/* b5 – paragraph with drop cap */}
      <Paragraph />

      {/* spot: seedling */}
      <div style={{position: 'absolute', left: 680, top: 1060}}>
        <Seedling at={T.seedling} size={330} />
      </div>
    </Page>
  );
};

const DC_SHIFT = 0; // drop-cap baseline alignment with line 3
const Paragraph: React.FC = () => {
  const f = useCurrentFrame();
  const FS = 60;
  const LH = 86;
  const cap = tween(f, T.dropCap, T.dropCap + 34, EASE_OUT);
  const indent = 218;
  const lines: Array<[string, boolean]> = [
    ['elişimin en hızlı', true],
    ['olduğu ilk yıllarda', true],
    ['başlanan destek,', true],
    ['sonraki öğrenmeler için', false],
    ['sağlam bir zemin oluşturur.', false],
  ];
  return (
    <Block top={500}>
      {/* drop cap */}
      <div
        style={{
          position: 'absolute',
          left: -8,
          top: 0,
          height: 3 * LH,
          width: indent,
          clipPath: 'inset(-60px -40px -4px -40px)',
        }}
      >
        <div
          style={{
            ...serif(144, 0),
            fontSize: 316,
            lineHeight: `${3 * LH}px`,
            fontWeight: 520,
            color: ACCENT_INK,
            transform: `translateY(${((1 - cap) * 270 + DC_SHIFT).toFixed(2)}px)`,
            opacity: interpolate(cap, [0, 0.4], [0, 1], {extrapolateRight: 'clamp'}),
          }}
        >
          G
        </div>
      </div>
      <div style={{...romanStyle, fontSize: FS}}>
        {lines.map(([t, ind], i) => (
          <Rise key={i} at={T.b5 + i * 5} lh={LH} style={{paddingLeft: ind ? indent : 0}} dur={30}>
            {t}
          </Rise>
        ))}
      </div>
    </Block>
  );
};

// ───────────────────────────────── PAGE 3 ─────────────────────────────────────

export const Page3: React.FC = () => {
  const o6 = T.b6Out;
  const o7 = T.b7Out;
  return (
    <Page folio={14} seed={13} span={[T.turn2, T.turn3 + TURN]}>
      {/* b6 */}
      <Block top={492}>
        <div style={{...romanStyle, fontSize: 68}}>
          <Rise at={T.b6} out={o6} lh={90}>Bir uzmana danışmak,</Rise>
          <div style={{color: INK2}}>
            <Rise at={T.b6 + STAGGER} out={o6 + EXIT_STAGGER} lh={90}>çocuğunuza bir etiket</Rise>
            <Rise at={T.b6 + 2 * STAGGER} out={o6 + 2 * EXIT_STAGGER} lh={90}>koymak değil;</Rise>
          </div>
        </div>
        <div style={{...quoteStyle, fontSize: 114, marginTop: 36}}>
          <Rise at={T.b6 + 4 * STAGGER + 6} out={o6 + 3 * EXIT_STAGGER} lh={128}>onu daha iyi</Rise>
          <Rise at={T.b6 + 5 * STAGGER + 6} out={o6 + 4 * EXIT_STAGGER} lh={128}>tanımak demektir.</Rise>
        </div>
      </Block>

      {/* b7 – pull quote between rules */}
      <Block top={580}>
        <Rule at={T.b7 - 8} out={o7 + 8} width={COL_W} thick={5} color={INK} dur={30} />
        <div style={{...serif(144, 0), fontWeight: 460, fontSize: 100, color: INK, marginTop: 44}}>
          <Rise at={T.b7} out={o7} lh={120}>Hiçbir liste</Rise>
          <Rise at={T.b7 + STAGGER} out={o7 + EXIT_STAGGER} lh={120}>çocuğunuzu sizden</Rise>
          <Rise at={T.b7 + 2 * STAGGER} out={o7 + 2 * EXIT_STAGGER} lh={120}>daha iyi tanıyamaz.</Rise>
        </div>
        <Rule at={T.b7 + 10} out={o7 + 12} width={COL_W} thick={2} color={INK} dur={30} style={{marginTop: 44}} />
      </Block>

      {/* b8 – closing line, circled */}
      <Block top={486}>
        <div style={{...quoteStyle, fontSize: 136}}>
          <Rise at={T.b8} lh={154} padBottom={50}>
            İçinizdeki{' '}
            <span style={{position: 'relative', display: 'inline-block'}}>
              sesi
              <HandCircle at={T.circle} />
            </span>
          </Rise>
          <Rise at={T.b8 + STAGGER} lh={154}>ciddiye alın.</Rise>
        </div>
      </Block>

      {/* b9 – signature block */}
      <Signature />
    </Page>
  );
};

const Signature: React.FC = () => {
  const f = useCurrentFrame();
  const s = T.sig;
  const write = interpolate(f, [s + 8, s + 52], [-8, 104], {
    extrapolateLeft: 'clamp',
    extrapolateRight: 'clamp',
    easing: EASE_INOUT,
  });
  const mark = tween(f, s + 52, s + 92, EASE_INOUT);
  return (
    <Block top={924}>
      <Rule at={s} width={150} thick={2} color={INK} dur={24} />
      <div
        style={{
          fontFamily: FONT.hand,
          fontWeight: 700,
          fontSize: 136,
          lineHeight: '150px',
          color: INK,
          marginTop: 22,
          marginLeft: -4,
          whiteSpace: 'nowrap',
          WebkitMaskImage: `linear-gradient(90deg, #000 ${write}%, transparent ${write + 8}%)`,
          maskImage: `linear-gradient(90deg, #000 ${write}%, transparent ${write + 8}%)`,
          width: 700,
        }}
      >
        Hanife Tetik
      </div>
      <div style={{display: 'flex', alignItems: 'flex-end', gap: 22, marginTop: 6}}>
        <div style={{...romanStyle, fontSize: 52, color: INK2, letterSpacing: '0.02em'}}>
          <Rise at={s + 40} lh={68}>
            Özel Eğitim Uzmanı
          </Rise>
        </div>
        <div style={{marginBottom: 6, opacity: mark > 0 ? 1 : 0}}>
          <Basak size={62} progress={mark} />
        </div>
      </div>
    </Block>
  );
};

// ─────────────────────────────── BACK COVER ───────────────────────────────────

export const BackCover: React.FC = () => {
  const f = useCurrentFrame();
  const settle = tween(f, T.turn3, T.turn3 + 56, EASE_OUT);
  const rule = tween(f, T.turn3 + 14, T.turn3 + 40, EASE_INOUT);
  return (
    <AbsoluteFill style={{background: C.green, overflow: 'hidden'}}>
      <Paper seed={21} base={C.green} dark />
      {/* inset hairline frame, like a printed back cover */}
      <div
        style={{
          position: 'absolute',
          left: 56,
          right: 56,
          top: 120,
          bottom: 120,
          border: `2px solid rgba(185,201,195,0.28)`,
        }}
      />
      <AbsoluteFill style={{alignItems: 'center', transform: `translateY(${((1 - settle) * 22).toFixed(2)}px)`}}>
        <div style={{position: 'absolute', top: 500, transform: `scale(${(1.03 - 0.03 * settle).toFixed(4)})`}}>
          <HasatLogo vertical dark width={400} />
        </div>
        <div style={{position: 'absolute', top: 1066, width: 900, display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
          <div style={{width: 120, height: 3, background: ACCENT, transform: `scaleX(${rule.toFixed(3)})`}} />
          <div style={{...quoteStyle, color: C.cream, fontSize: 66, lineHeight: '86px', marginTop: 36, textAlign: 'center'}}>
            Yazının tamamı blogumuzda.
          </div>
        </div>
      </AbsoluteFill>
      <Grain seed={26} dark />
    </AbsoluteFill>
  );
};
