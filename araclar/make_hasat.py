"""Build the Hasat Özel Eğitim logo SVGs with text converted to outlines.

Usage: python3 make_hasat.py <fonts_dir> <out_dir>
"""
import io
import os
import sys

import uharfbuzz as hb
from fontTools.pens.boundsPen import BoundsPen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont

FONTS, OUT = sys.argv[1], sys.argv[2]
os.makedirs(OUT, exist_ok=True)

GREEN, ORANGE, RED, IVORY, SAGE, MUTED = "#12312B", "#E8A33D", "#B02315", "#F4F6F3", "#B9C9C3", "#3E5650"


def load(path, axes):
    font = instantiateVariableFont(TTFont(path), axes)
    buf = io.BytesIO()
    font.save(buf)
    data = buf.getvalue()
    return TTFont(io.BytesIO(data)), hb.Font(hb.Face(data))


BRIC = load(os.path.join(FONTS, "bricolage.ttf"), {"wght": 650, "opsz": 26, "wdth": 100})
INTER = load(os.path.join(FONTS, "inter.ttf"), {"wght": 600, "opsz": 14})


def text_path(fontpair, text, size, tracking_em, x0, baseline):
    """Return (svg path d, bounds) for text set at `size`, with letter-spacing in em."""
    tt, hbfont = fontpair
    upm = tt["head"].unitsPerEm
    scale = size / upm
    buf = hb.Buffer()
    buf.add_str(text)
    buf.guess_segment_properties()
    hb.shape(hbfont, buf, {"kern": True, "liga": True})
    glyphset = tt.getGlyphSet()
    order = tt.getGlyphOrder()
    spen = SVGPathPen(glyphset)
    bpen = BoundsPen(glyphset)
    x = x0
    for info, pos in zip(buf.glyph_infos, buf.glyph_positions):
        name = order[info.codepoint]
        gx = x + pos.x_offset * scale
        gy = baseline - pos.y_offset * scale
        t = (scale, 0, 0, -scale, gx, gy)
        glyphset[name].draw(TransformPen(spen, t))
        glyphset[name].draw(TransformPen(bpen, t))
        x += pos.x_advance * scale + tracking_em * size
    x -= tracking_em * size  # no trailing tracking
    return spen.getCommands(), bpen.bounds, x


def mark(x, y, s, square):
    """The wheat-ear mark (40-unit grid) placed at (x, y) with scale s; `square` = stem colour."""
    def p(v):
        return round(v, 2)
    g = ORANGE
    return (
        f'<g transform="translate({p(x)} {p(y)}) scale({p(s)})">'
        f'<path d="M20 38.5 V13.5" fill="none" stroke="{square}" stroke-width="1.1" stroke-linecap="round"/>'
        + "".join(
            f'<path transform="translate({cx} {cy}) rotate({r})" d="{GRAIN}" fill="{g}"/>'
            for cx, cy, r in [(20, 6.5, 0), (16.2, 12.9, -32), (23.8, 12.9, 32), (16.2, 19.4, -32),
                              (23.8, 19.4, 32), (16.2, 25.9, -32), (23.8, 25.9, 32)]
        )
        + "</g>"
    )


GRAIN = "M0 -6 C 2.4 -3, 2.4 3, 0 6 C -2.4 3, -2.4 -3, 0 -6 Z"


def _unused():
    return (
        ""
        f"</g>"
    )


# Mark geometry bounds on the 40 grid (incl. triangle stroke)
MX0, MY0, MX1, MY1 = 11.3, 0.5, 28.7, 39.4


def svg(w, h, body, title):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {round(w, 2)} {round(h, 2)}" '
            f'width="{round(w)}" height="{round(h)}" role="img" aria-label="{title}">'
            f"<title>{title}</title>{body}</svg>\n")


def write(name, content):
    with open(os.path.join(OUT, name), "w", encoding="utf-8") as f:
        f.write(content)
    print("wrote", name)


TITLE = "Hasat Özel Eğitim"

# --- Mark only -------------------------------------------------------------
pad = 2
mw, mh = MX1 - MX0 + 2 * pad, MY1 - MY0 + 2 * pad
write("hasat-isaret.svg", svg(mw * 4, mh * 4, mark((pad - MX0) * 4, (pad - MY0) * 4, 4, GREEN), TITLE))
write("hasat-isaret-koyu-zemin.svg", svg(mw * 4, mh * 4, mark((pad - MX0) * 4, (pad - MY0) * 4, 4, IVORY), TITLE))

# --- App icon (rounded tile) -----------------------------------------------
tile = 512
s = tile * 0.62 / 40
off = (tile - 40 * s) / 2
cx_shift = (40 - (MX0 + MX1)) / 2 * s  # optical centring
cy_shift = (40 - (MY0 + MY1)) / 2 * s
write("hasat-uygulama-simgesi.svg", svg(tile, tile,
      f'<rect width="{tile}" height="{tile}" rx="112" fill="{IVORY}"/>' + mark(off + cx_shift, off + cy_shift, s, GREEN), TITLE))


# --- Horizontal lockup ------------------------------------------------------
def horizontal(word_color, sub_color, square, bg=None):
    m_s = 2.4                      # mark scale -> ~96 px tall
    word_size, sub_size = 66, 21
    gap = 24
    mark_w, mark_h = (MX1 - MX0) * m_s, (MY1 - MY0) * m_s
    tx = mark_w + gap
    d1, b1, _ = text_path(BRIC, "Hasat", word_size, -0.02, tx, 0)
    d2, b2, _ = text_path(INTER, "ÖZEL EĞİTİM", sub_size, 0.18, tx + 2, 0)
    # stack: word baseline at 0, sub cap-top 10px below word baseline (+descender of word not present in 'kavram')
    sub_top_gap = 12
    shift2 = (b1[3] * 0) + sub_top_gap - b2[1]   # b2[1] = top (min y) of sub glyphs
    block_top, block_bot = b1[1], b2[3] + shift2
    block_h = block_bot - block_top
    # vertical centring of text block against mark
    total_h = max(mark_h, block_h)
    text_dy = (total_h - block_h) / 2 - block_top
    mark_dy = (total_h - mark_h) / 2
    width = max(b1[2], b2[2]) + 0
    body = ""
    pad = 24
    if bg:
        body += f'<rect width="{round(width + 2 * pad, 2)}" height="{round(total_h + 2 * pad, 2)}" rx="24" fill="{bg}"/>'
    body += f'<g transform="translate({pad} {pad})">'
    body += mark(-MX0 * m_s, mark_dy - MY0 * m_s, m_s, square)
    body += f'<path transform="translate(0 {round(text_dy, 2)})" fill="{word_color}" d="{d1}"/>'
    body += f'<path transform="translate(0 {round(text_dy + shift2, 2)})" fill="{sub_color}" d="{d2}"/>'
    body += "</g>"
    return svg(width + 2 * pad, total_h + 2 * pad, body, TITLE)


write("hasat-logo-yatay.svg", horizontal(GREEN, MUTED, GREEN))
write("hasat-logo-yatay-koyu-zemin.svg", horizontal(IVORY, SAGE, IVORY, bg=GREEN))


# --- Stacked lockup (mark above text, centred) ------------------------------
def stacked(word_color, sub_color, square, bg=None):
    m_s = 3.2
    word_size, sub_size = 72, 22
    d1, b1, w1 = text_path(BRIC, "Hasat", word_size, -0.02, 0, 0)
    d2, b2, w2 = text_path(INTER, "ÖZEL EĞİTİM", sub_size, 0.18, 0, 0)
    tw1, tw2 = b1[2] - b1[0], b2[2] - b2[0]
    mark_w, mark_h = (MX1 - MX0) * m_s, (MY1 - MY0) * m_s
    width = max(mark_w, tw1, tw2)
    gap1, gap2 = 22, 14
    y_word = mark_h + gap1 - b1[1]
    y_sub = y_word + b1[3] + gap2 - b2[1]
    height = y_sub + b2[3]
    pad = 32
    body = ""
    if bg:
        body += f'<rect width="{round(width + 2 * pad, 2)}" height="{round(height + 2 * pad, 2)}" rx="28" fill="{bg}"/>'
    body += f'<g transform="translate({pad} {pad})">'
    body += mark((width - mark_w) / 2 - MX0 * m_s, -MY0 * m_s, m_s, square)
    body += f'<path transform="translate({round((width - tw1) / 2 - b1[0], 2)} {round(y_word, 2)})" fill="{word_color}" d="{d1}"/>'
    body += f'<path transform="translate({round((width - tw2) / 2 - b2[0], 2)} {round(y_sub, 2)})" fill="{sub_color}" d="{d2}"/>'
    body += "</g>"
    return svg(width + 2 * pad, height + 2 * pad, body, TITLE)


write("hasat-logo-dikey.svg", stacked(GREEN, MUTED, GREEN))
write("hasat-logo-dikey-koyu-zemin.svg", stacked(IVORY, SAGE, IVORY, bg=GREEN))


# --- Profile pictures (square, off-white background, safe for circular crop) --
PP = 1024


def profile_mark_only():
    s = PP * 0.58 / (MY1 - MY0)                       # mark height = 58% of canvas (tall mark)
    mw_, mh_ = (MX1 - MX0) * s, (MY1 - MY0) * s
    x = (PP - mw_) / 2 - MX0 * s
    y = (PP - mh_) / 2 - MY0 * s
    return svg(PP, PP, f'<rect width="{PP}" height="{PP}" fill="{IVORY}"/>' + mark(x, y, s, GREEN), TITLE)


def profile_with_text():
    s = PP * 0.30 / (MX1 - MX0)
    mw_, mh_ = (MX1 - MX0) * s, (MY1 - MY0) * s
    d1, b1, _ = text_path(BRIC, "Hasat", 150, -0.02, 0, 0)
    d2, b2, _ = text_path(INTER, "ÖZEL EĞİTİM", 44, 0.18, 0, 0)
    tw1, tw2 = b1[2] - b1[0], b2[2] - b2[0]
    gap1, gap2 = 44, 26
    h_word = b1[3] - b1[1]
    h_sub = b2[3] - b2[1]
    block_h = mh_ + gap1 + h_word + gap2 + h_sub
    top = (PP - block_h) / 2
    y_mark = top
    y_word = top + mh_ + gap1 - b1[1]
    y_sub = y_word + b1[3] + gap2 - b2[1]
    body = f'<rect width="{PP}" height="{PP}" fill="{IVORY}"/>'
    body += mark((PP - mw_) / 2 - MX0 * s, y_mark - MY0 * s, s, GREEN)
    body += f'<path transform="translate({round((PP - tw1) / 2 - b1[0], 2)} {round(y_word, 2)})" fill="{GREEN}" d="{d1}"/>'
    body += f'<path transform="translate({round((PP - tw2) / 2 - b2[0], 2)} {round(y_sub, 2)})" fill="{MUTED}" d="{d2}"/>'
    return svg(PP, PP, body, TITLE)


write("hasat-profil-fotografi.svg", profile_mark_only())
write("hasat-profil-fotografi-yazili.svg", profile_with_text())
