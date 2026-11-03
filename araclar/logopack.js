// Export every logo SVG to a high-resolution PNG and a vector PDF.
// node logopack.js <svg_dir> <out_dir>
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');
(async () => {
  const [src, out] = process.argv.slice(2);
  for (const d of ['SVG', 'PNG', 'PDF']) fs.mkdirSync(path.join(out, d), { recursive: true });
  const b = await chromium.launch();
  const files = fs.readdirSync(src).filter(f => f.startsWith('hasat-') && f.endsWith('.svg')).sort();
  for (const f of files) {
    const name = f.replace(/\.svg$/, '');
    const svg = fs.readFileSync(path.join(src, f), 'utf8');
    fs.copyFileSync(path.join(src, f), path.join(out, 'SVG', f));
    const [, , w, h] = svg.match(/viewBox="([^"]+)"/)[1].split(/\s+/).map(Number);
    const hasBg = /<rect /.test(svg);
    const dark = name.includes('koyu-zemin');
    // PNG: longest side 2400 px, transparent where the SVG has no background
    const scale = 2400 / Math.max(w, h);
    const W = Math.round(w * scale), H = Math.round(h * scale);
    const inner = svg.replace(/<svg([^>]*?)\swidth="[^"]*"/, '<svg$1').replace(/<svg([^>]*?)\sheight="[^"]*"/, '<svg$1')
                     .replace('<svg', `<svg width="${W}" height="${H}"`);
    const p = await b.newPage({ viewport: { width: W, height: H } });
    await p.setContent(`<html><body style="margin:0;background:transparent">${inner}</body></html>`);
    await p.screenshot({ path: path.join(out, 'PNG', name + '.png'), omitBackground: !hasBg, clip: { x: 0, y: 0, width: W, height: H } });
    // PDF: vector, at the logo's own size in mm (1 unit = 1 px at 96 dpi), with a dark page for light-on-dark marks
    const pw = Math.round(w * (h > 600 ? 0.25 : 1)), ph = Math.round(h * (h > 600 ? 0.25 : 1));
    const vec = svg.replace(/<svg([^>]*?)\swidth="[^"]*"/, '<svg$1').replace(/<svg([^>]*?)\sheight="[^"]*"/, '<svg$1')
                   .replace('<svg', `<svg width="${pw}" height="${ph}"`);
    const bg = dark && !hasBg ? '#12312B' : 'transparent';
    await p.setContent(`<html><head><style>@page{size:${pw}px ${ph}px;margin:0}html,body{margin:0;background:${bg}}svg{display:block}</style></head><body>${vec}</body></html>`);
    await p.pdf({ path: path.join(out, 'PDF', name + '.pdf'), width: pw + 'px', height: ph + 'px', printBackground: true, pageRanges: '1' });
    await p.close();
    console.log(name, `${W}x${H}px`, `pdf ${pw}x${ph}px`);
  }
  await b.close();
})();
