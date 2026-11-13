# Hasat video series — creative & technical brief (for every agent)

## Who this is for
**Hasat Özel Eğitim** is a Turkish online special-education and family-counselling practice run by
**Hanife Tetik** (Özel Eğitim Uzmanı). Audience: Turkish-speaking parents in Türkiye and abroad (mainly
Germany) whose young children have — or might have — autism, speech delay or learning difficulties.
The brand voice is **calm, warm, evidence-based, practical, never alarmist, never salesy**. Parents
watching may be worried or exhausted: the motion should feel confident and kind, not frantic.

These are short **vertical informational videos (Reels / TikTok / Shorts)**, text-on-screen only
(no voice-over, no music — the owner adds sound when publishing). Every video is built in a
**completely different visual style**; your style is described in your script file. Make it the best
possible example of that style — the kind of piece a top motion-design studio would put in its reel.

The content comes from Hasat's own published blog posts and has been fact-checked. **Use the Turkish
on-screen text from your script exactly.** You may split it into lines/beats however you like, and
you may make tiny wording changes only if a layout truly demands it (report every change). Do not add
new factual claims, statistics, disclaimers, URLs, hashtags or calls to action beyond what the script
says. No "consult a doctor / not a diagnosis" end disclaimer — the owner explicitly does not want it.

## Technical frame
- Remotion 4 project at `/home/user/hasatozelegitim/video` (React 19, TypeScript). 1080×1920, 30 fps.
- **Only edit files inside your own folder** `src/videos/<your-dir>/` (create as many files there as
  you like). Do not edit `src/shared/*`, `src/Root.tsx`, `src/entries/*`, scripts or other videos — ten
  agents work in parallel. If you think something shared needs a fix, say so in your final report.
- Your `index.tsx` must keep exporting `meta` (`{id, durationInFrames, coverFrame}`) and `Video`.
  `coverFrame` = the single frame that works best as the thumbnail/cover (title clearly readable).
- Shared helpers in `src/shared/brand.tsx` (importing it also loads all fonts):
  - `C` — brand colours: green `#12312B` (main dark/text), greenDeep `#0B201C`, orange `#E8A33D`
    (accent, wheat grains), orangeDeep `#A8681A`, cream `#F4F6F3` (background), text2 `#3E5650`,
    panel `#E3ECE7`, line `#D9E0DC`, line2 `#C9D3CE`, sage `#B9C9C3`.
  - `FONT` — heading (Bricolage Grotesque, brand headings, use weight ~650), body (Inter), serif
    (Fraunces, variable incl. italic), serifDisplay (DM Serif Display), hand (Caveat 400–700),
    grotesk (Space Grotesk), geometric (Outfit), mono (IBM Plex Mono), rounded (Nunito). All support
    Turkish (ğ ş ı İ ç ö ü). Do not load other fonts; no network requests at all.
  - `Basak` — the animated Hasat wheat-ear mark (`progress` 0→1 draws stem then grains).
  - `HasatLogo` — official logo image (`dark` for dark backgrounds, `vertical` for stacked version).
  - `SAFE` — safe zone. Keep all important text inside: top 220px, bottom 400px, right 140px, left 80px
    are covered by app UI. Decorative elements may go anywhere.
  - `SafeZoneDebug` — overlay to check the safe zone while developing. **Remove before finishing.**
- Available packages: `remotion` (interpolate, spring, Easing, Sequence, Series, AbsoluteFill,
  `random(seed)`), `@remotion/transitions` (TransitionSeries + fade/slide/wipe/flip/clockWipe…),
  `@remotion/paths` (evolvePath, getLength, interpolatePath…), `@remotion/shapes`, `@remotion/noise`,
  `@remotion/layout-utils` (measureText, fitText). Plain SVG/CSS is fine for everything else.
- Must be deterministic: no `Math.random()`, `Date`, timers or CSS animations/transitions — everything
  is driven by `useCurrentFrame()`. No emoji (there is no emoji font). No external images/stock;
  draw illustrations and icons yourself in SVG.
- Turkish typography: use real quotes “ ” and ’, en dash –, ellipsis …. **Never use CSS
  `text-transform: uppercase`** (it turns i into I instead of İ) — write capitals literally (e.g.
  "AİLELER İÇİN"). Check every ı/i, İ/I, ğ, ş in your output frames.

## Quality bar
- **Readability first.** Body text ≥ 46px, key lines 64–140px. Strong contrast. Each text beat stays
  fully readable on screen for at least `0.35 s × words + 1.2 s` (Turkish is read slower on phones).
  Never show two competing text blocks animating at once.
- **Hook immediately**: something meaningful is visible by frame ~8 and the first statement is fully
  readable within the first 1.5 s. Frame 0 must not be an empty background.
- **Motion craft**: eased/spring motion (no linear slides), purposeful staging, overlapping action,
  consistent motion language within your style, clean transitions between beats, no jitter, no
  flashing/strobing (photosensitive viewers), no text crossing the safe-zone edges mid-animation.
- **Brand**: build on the Hasat palette. Your style may add 1–2 supporting colours if they harmonise
  (muted, natural — never neon). End with a ~2.5–3.5 s brand outro designed *in your style* that
  shows the Hasat logo (`HasatLogo` or `Basak` + the name "Hasat Özel Eğitim") and the line
  "Yazının tamamı blogumuzda." Nothing else in the outro.
- Duration: follow the target in your script (all between ~35 and ~65 s).

## Your workflow (iterate like a senior motion designer)
1. Read this brief and your `SCRIPT.md` (in your folder). Plan beats with frame timings first.
2. Build it. Organise code into small components; keep timing constants in one place.
3. Preview — renders stills from an isolated entry, so other agents can't break your preview:
   - `node scripts/preview.mjs <id>` → 12 evenly spaced frames + labelled contact sheet
     `.preview/<id>/sheet.png` (open it with the Read tool to look at it).
   - `--n 20`, `--frames 0,45,90`, `--from 300 --to 420 --n 8` (inspect a transition), `--scale 1`
     (full-res single frames to check typography details).
   - `--video` renders a low-res MP4 of every frame (use once near the end to prove no frame throws).
   - Typecheck: `npx tsc --noEmit 2>&1 | grep <your-dir>` (ignore other folders' errors).
   CPU is shared by ten agents: keep stills at the default 0.5 scale except for spot checks, and
   don't render more than you need. Never run `--final` (the orchestrator renders finals).
4. **Look at your frames and critique them honestly** at least 3–4 rounds: overflow/cut-off text,
   overlaps, awkward line breaks (no single orphan word on a line if avoidable), safe zone, timing,
   hierarchy, whitespace, consistency, mid-transition frames, Turkish characters. Fix and re-check.
5. Final report (keep it short): duration (s), coverFrame, one-paragraph description of the style
   and beats, any text changes vs. the script, anything you'd still improve.
