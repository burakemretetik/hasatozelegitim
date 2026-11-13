#!/usr/bin/env node
// Preview / render tool for the Hasat videos.
//
//   node scripts/preview.mjs v03                     -> 12 evenly spaced frames + contact sheet
//   node scripts/preview.mjs v03 --n 20              -> 20 evenly spaced frames
//   node scripts/preview.mjs v03 --frames 0,45,90    -> exact frames
//   node scripts/preview.mjs v03 --from 300 --to 420 --n 8   -> frames within a range
//   node scripts/preview.mjs v03 --scale 1           -> full resolution stills (default 0.5)
//   node scripts/preview.mjs v03 --video             -> low-res MP4 of the whole video (catches runtime errors on every frame)
//   node scripts/preview.mjs v03 --final             -> full quality MP4 into out/
//
// Output: .preview/<id>/frame-<frame>.png and .preview/<id>/sheet.png (labelled contact sheet).
// Uses a single-composition entry (src/entries/<id>.tsx) so other videos' code cannot break your preview.
import {bundle} from '@remotion/bundler';
import {renderMedia, renderStill, selectComposition, openBrowser} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {VIDEOS} from './videos.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BROWSER =
  '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';

const args = process.argv.slice(2);
const id = args[0];
const v = VIDEOS.find((x) => x.id === id);
if (!v) {
  console.error('Usage: node scripts/preview.mjs <v01..v10> [--n 12] [--frames a,b] [--from a --to b] [--scale 0.5] [--video] [--final]');
  process.exit(1);
}
const opt = (name, def) => {
  const i = args.indexOf('--' + name);
  return i >= 0 ? args[i + 1] : def;
};
const flag = (name) => args.includes('--' + name);

const outDir = path.join(ROOT, '.preview', id);
fs.mkdirSync(outDir, {recursive: true});

const t0 = Date.now();
const serveUrl = await bundle({
  entryPoint: path.join(ROOT, 'src/entries', id + '.tsx'),
  publicDir: path.join(ROOT, 'public'),
  outDir: path.join(ROOT, '.bundle-cache', id),
  enableCaching: true,
  onProgress: () => {},
});
const browser = await openBrowser('chrome', {browserExecutable: BROWSER, chromiumOptions: {gl: 'swangle'}});
const composition = await selectComposition({serveUrl, id, puppeteerInstance: browser});
const total = composition.durationInFrames;
console.log(`[${id}] bundled in ${((Date.now() - t0) / 1000).toFixed(1)}s · ${total} frames (${(total / composition.fps).toFixed(1)}s)`);

if (flag('final') || flag('video')) {
  const final = flag('final');
  const file = final
    ? path.join(ROOT, 'out', v.out + '.mp4')
    : path.join(outDir, 'preview.mp4');
  fs.mkdirSync(path.dirname(file), {recursive: true});
  let last = -1;
  await renderMedia({
    serveUrl,
    composition,
    codec: 'h264',
    outputLocation: file,
    puppeteerInstance: browser,
    scale: final ? 1 : 0.5,
    crf: final ? 18 : 28,
    pixelFormat: 'yuv420p',
    x264Preset: final ? 'slow' : 'veryfast',
    imageFormat: 'jpeg',
    jpegQuality: final ? 95 : 80,
    concurrency: Number(opt('concurrency', final ? 4 : 2)),
    muted: true,
    enforceAudioTrack: false,
    onProgress: ({progress}) => {
      const p = Math.floor(progress * 10);
      if (p !== last) {
        last = p;
        process.stdout.write(`${p * 10}% `);
      }
    },
  });
  console.log(`\n[${id}] wrote ${path.relative(ROOT, file)} in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  await browser.close({silent: true});
  process.exit(0);
}

// ---- stills ----
let frames;
if (opt('frames')) {
  frames = opt('frames').split(',').map((s) => Number(s.trim()));
} else {
  const n = Number(opt('n', 12));
  const from = Number(opt('from', 0));
  const to = Number(opt('to', total - 1));
  frames = Array.from({length: n}, (_, i) => Math.round(from + ((to - from) * i) / Math.max(1, n - 1)));
}
frames = [...new Set(frames.filter((f) => f >= 0 && f < total))];
const scale = Number(opt('scale', 0.5));

// clean old frames so the sheet only shows this run
for (const f of fs.readdirSync(outDir)) if (f.startsWith('frame-')) fs.unlinkSync(path.join(outDir, f));

const written = [];
for (const frame of frames) {
  const file = path.join(outDir, `frame-${String(frame).padStart(4, '0')}.png`);
  await renderStill({serveUrl, composition, frame, output: file, scale, puppeteerInstance: browser, imageFormat: 'png'});
  written.push({frame, file});
}
await browser.close({silent: true});

// contact sheet (labelled) with python/PIL
const sheet = path.join(outDir, 'sheet.png');
const py = `
import sys, json
from PIL import Image, ImageDraw, ImageFont
items = json.loads(sys.argv[1]); out = sys.argv[2]; fps = int(sys.argv[3])
tw = 270
ims = [Image.open(i['file']).convert('RGB') for i in items]
th = round(ims[0].height * tw / ims[0].width)
cols = min(6, len(ims)) if len(ims) > 4 else len(ims)
rows = (len(ims) + cols - 1) // cols
lab = 26
S = Image.new('RGB', (cols * (tw + 8) + 8, rows * (th + lab + 8) + 8), (40, 40, 40))
d = ImageDraw.Draw(S)
try: font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 18)
except Exception: font = ImageFont.load_default()
for k, (it, im) in enumerate(zip(items, ims)):
    r, c = divmod(k, cols)
    x = 8 + c * (tw + 8); y = 8 + r * (th + lab + 8)
    S.paste(im.resize((tw, th)), (x, y + lab))
    d.text((x + 4, y + 3), f"f{it['frame']}  {it['frame']/fps:.1f}s", fill=(255, 220, 120), font=font)
S.save(out)
`;
execFileSync('python3', ['-c', py, JSON.stringify(written), sheet, String(composition.fps)]);
console.log(`[${id}] ${written.length} frames @${scale}x -> ${path.relative(ROOT, outDir)}/  · sheet: ${path.relative(ROOT, sheet)}  · ${((Date.now() - t0) / 1000).toFixed(1)}s`);
