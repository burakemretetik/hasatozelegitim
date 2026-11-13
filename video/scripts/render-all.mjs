#!/usr/bin/env node
// Final renders: one bundle of src/index.ts, then for each video an MP4 + a cover PNG.
//   node scripts/render-all.mjs            -> all videos
//   node scripts/render-all.mjs v03 v07    -> only these
// Output: out/<name>.mp4, out/kapak/<name>.png (cover at meta.coverFrame), out/onizleme.png (overview)
import {bundle} from '@remotion/bundler';
import {openBrowser, renderMedia, renderStill, selectComposition} from '@remotion/renderer';
import {execFileSync} from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {VIDEOS} from './videos.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BROWSER =
  '/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell';
const only = process.argv.slice(2);
const list = only.length ? VIDEOS.filter((v) => only.includes(v.id)) : VIDEOS;

const OUT = path.join(ROOT, 'out');
fs.mkdirSync(path.join(OUT, 'kapak'), {recursive: true});

const t0 = Date.now();
const serveUrl = await bundle({
  entryPoint: path.join(ROOT, 'src/index.ts'),
  publicDir: path.join(ROOT, 'public'),
  outDir: path.join(ROOT, '.bundle-cache', 'all'),
  enableCaching: true,
  onProgress: () => {},
});
const browser = await openBrowser('chrome', {browserExecutable: BROWSER, chromiumOptions: {gl: 'swangle'}});
console.log(`bundled in ${((Date.now() - t0) / 1000).toFixed(1)}s`);

// meta.coverFrame is read from the composition's module via a tiny eval in the bundle would be overkill;
// we read it from the source file instead.
const coverFrameOf = (v) => {
  const src = fs.readFileSync(path.join(ROOT, 'src/videos', v.dir, 'index.tsx'), 'utf8');
  const m = src.match(/coverFrame\s*:\s*(\d+)/);
  return m ? Number(m[1]) : 0;
};

for (const v of list) {
  const t1 = Date.now();
  const composition = await selectComposition({serveUrl, id: v.id, puppeteerInstance: browser});
  const file = path.join(OUT, v.out + '.mp4');
  let last = -1;
  process.stdout.write(`[${v.id}] ${composition.durationInFrames} frames … `);
  await renderMedia({
    serveUrl,
    composition,
    codec: 'h264',
    outputLocation: file,
    puppeteerInstance: browser,
    crf: 18,
    pixelFormat: 'yuv420p',
    x264Preset: 'slow',
    imageFormat: 'jpeg',
    jpegQuality: 95,
    concurrency: 4,
    muted: true,
    enforceAudioTrack: false,
    onProgress: ({progress}) => {
      const p = Math.floor(progress * 4);
      if (p !== last) {
        last = p;
        process.stdout.write(`${p * 25}% `);
      }
    },
  });
  const cover = path.join(OUT, 'kapak', v.out + '.png');
  await renderStill({serveUrl, composition, frame: coverFrameOf(v), output: cover, puppeteerInstance: browser, imageFormat: 'png'});
  const mb = (fs.statSync(file).size / 1e6).toFixed(1);
  console.log(`done ${(composition.durationInFrames / composition.fps).toFixed(1)}s video, ${mb} MB, ${((Date.now() - t1) / 1000).toFixed(0)}s`);
}
await browser.close({silent: true});

// overview of all covers
const covers = VIDEOS.map((v) => path.join(OUT, 'kapak', v.out + '.png')).filter((f) => fs.existsSync(f));
if (covers.length) {
  const py = `
import sys, json
from PIL import Image
files = json.loads(sys.argv[1]); out = sys.argv[2]
tw = 360; ims = [Image.open(f).convert('RGB') for f in files]
th = round(ims[0].height * tw / ims[0].width)
cols = 5; rows = (len(ims) + cols - 1) // cols
S = Image.new('RGB', (cols * (tw + 16) + 16, rows * (th + 16) + 16), (30, 30, 30))
for k, im in enumerate(ims):
    r, c = divmod(k, cols)
    S.paste(im.resize((tw, th), Image.LANCZOS), (16 + c * (tw + 16), 16 + r * (th + 16)))
S.save(out)
`;
  execFileSync('python3', ['-c', py, JSON.stringify(covers), path.join(OUT, 'onizleme.png')]);
}
console.log(`all done in ${((Date.now() - t0) / 60000).toFixed(1)} min`);
