"""Convert the Design canvas .dc.html artboards into a static site for GitHub Pages.

Usage: python3 build_site.py <project_dir> <out_dir>
"""
import html
import json
import os
import re
import sys

SRC, OUT = sys.argv[1], sys.argv[2]
ACCENT = "#E8A33D"

# ---------------------------------------------------------------- domain / SEO
# The custom domain is prepared but not active yet. When the DNS records are in place
# (see README), set CUSTOM_DOMAIN = "hasatozelegitim.com" and rebuild: canonical URLs,
# hreflang links, sitemap and share images then use the domain and a CNAME file is written.
CUSTOM_DOMAIN = None
DEFAULT_URL = "https://burakemretetik.github.io/hasatozelegitim/"
SITE_URL = f"https://{CUSTOM_DOMAIN}/" if CUSTOM_DOMAIN else DEFAULT_URL
LASTMOD = "2026-11-03"
SITE_NAME = "Hasat Özel Eğitim"

# Turkish page -> German counterpart (for hreflang and the sitemap)
PAIRS = {
    "Main.dc.html": "Deutsch.dc.html",
    "Blog.dc.html": "BlogDe.dc.html",
    "BlogYazi.dc.html": "BlogYaziDe.dc.html",
    "BlogOtizm.dc.html": "BlogOtizmDe.dc.html",
    "BlogIkiDil.dc.html": "BlogIkiDilDe.dc.html",
    "BlogDisleksi.dc.html": "BlogDisleksiDe.dc.html",
    "BlogRutin.dc.html": "BlogRutinDe.dc.html",
    "Kunye.dc.html": "Impressum.dc.html",
    "Gizlilik.dc.html": "Datenschutz.dc.html",
}
COUNTERPART = {**PAIRS, **{v: k for k, v in PAIRS.items()}}
# blog articles and their publication dates
ARTICLE_DATES = {
    "BlogYazi.dc.html": "2026-10-27", "BlogYaziDe.dc.html": "2026-10-27",
    "BlogOtizm.dc.html": "2026-11-03", "BlogOtizmDe.dc.html": "2026-11-03",
    "BlogIkiDil.dc.html": "2026-11-03", "BlogIkiDilDe.dc.html": "2026-11-03",
    "BlogDisleksi.dc.html": "2026-11-03", "BlogDisleksiDe.dc.html": "2026-11-03",
    "BlogRutin.dc.html": "2026-11-03", "BlogRutinDe.dc.html": "2026-11-03",
}
HOME_PAGES = {"Main.dc.html", "Deutsch.dc.html"}

# source artboard -> output path, language, description
PAGES = {
    "Main.dc.html": ("index.html", "tr",
        "Otizm ve disleksi alanında Türkçe online özel eğitim ve aile danışmanlığı. Özel eğitim uzmanı Hanife Tetik ile, Türkiye'den ya da yurt dışından."),
    "Deutsch.dc.html": ("de/index.html", "de",
        "Förderung bei Autismus und Legasthenie – online und auf Türkisch. Einzelstunden und Elternberatung mit der Sonderpädagogin Hanife Tetik."),
    "Blog.dc.html": ("blog/index.html", "tr",
        "Otizm, disleksi, iki dillilik ve evde destek üzerine ailelere yol gösteren yazılar."),
    "BlogYazi.dc.html": ("blog/online-ders-hazirligi.html", "tr",
        "Online özel eğitim dersinden en iyi verimi almak için evde yapabileceğiniz küçük ama etkili hazırlıklar."),
    "BlogDe.dc.html": ("de/blog/index.html", "de",
        "Beiträge zu Autismus, Legasthenie, Zweisprachigkeit und Förderung zu Hause."),
    "BlogYaziDe.dc.html": ("de/blog/online-foerderstunde.html", "de",
        "Kleine, aber wirkungsvolle Vorbereitungen, damit Ihr Kind die Online-Förderstunde bestmöglich nutzen kann."),
    "BlogOtizm.dc.html": ("blog/otizmde-erken-belirtiler.html", "tr",
        "Otizmin erken belirtileri: sosyal iletişim, dil gelişimi ve tekrarlayan davranışlarda nelere dikkat etmeli, endişelendiğinizde kime başvurmalı?"),
    "BlogIkiDil.dc.html": ("blog/iki-dilli-buyumek.html", "tr",
        "Yurt dışında yaşayan aileler için: İki dillilik dil gelişimini geciktirmez. Otizmli çocuklarda da evde Türkçe konuşmaya devam etmek için nedenler ve öneriler."),
    "BlogOtizmDe.dc.html": ("de/blog/fruehe-anzeichen-autismus.html", "de",
        "Frühe Anzeichen von Autismus: worauf Eltern bei sozialer Kommunikation, Sprache und wiederholendem Verhalten achten können und an wen sie sich wenden."),
    "BlogIkiDilDe.dc.html": ("de/blog/zweisprachig-aufwachsen.html", "de",
        "Zweisprachigkeit verzögert die Sprachentwicklung nicht – auch nicht bei Kindern im Autismus-Spektrum. Warum sich die Familiensprache lohnt und was Sie zu Hause tun können."),
    "BlogDisleksi.dc.html": ("blog/disleksinin-ilk-isaretleri.html", "tr",
        "Disleksinin okul öncesi ve okula başlarken görülen ilk işaretleri, iki dilli çocuklarda dikkat edilmesi gerekenler ve Türkiye ile Almanya'da tanı süreci."),
    "BlogRutin.dc.html": ("blog/gunluk-rutinler.html", "tr",
        "Öngörülebilir bir gün otizmli çocuklara güven verir. Görsel program, geçişler ve esneklik üzerine evde uygulanabilecek pratik öneriler."),
    "BlogDisleksiDe.dc.html": ("de/blog/erste-anzeichen-legasthenie.html", "de",
        "Erste Anzeichen von Legasthenie vor und nach dem Schulstart, Besonderheiten bei zweisprachigen Kindern und der Weg zur Diagnose in Deutschland und der Türkei."),
    "BlogRutinDe.dc.html": ("de/blog/feste-tagesablaeufe.html", "de",
        "Ein vorhersehbarer Tag gibt Kindern im Autismus-Spektrum Sicherheit. Praktische Tipps zu visuellen Tagesplänen, Übergängen und Flexibilität."),
    "Kunye.dc.html": ("kunye/index.html", "tr", "Hasat Özel Eğitim künye bilgileri."),
    "Gizlilik.dc.html": ("gizlilik/index.html", "tr", "Hasat Özel Eğitim gizlilik ve kişisel verilerin korunması metni (KVKK ve GDPR)."),
    "Impressum.dc.html": ("de/impressum/index.html", "de", "Impressum von Hasat Özel Eğitim."),
    "Datenschutz.dc.html": ("de/datenschutz/index.html", "de", "Datenschutzerklärung von Hasat Özel Eğitim (DSGVO und KVKK)."),
}

# Only these articles exist. Cards for other titles are left out of the home page and
# the "related" block; on the blog page they are listed under "posts in preparation".
REAL_TITLES = {
    "Online özel eğitim dersine evde nasıl hazırlanılır?",
    "Wie bereite ich mein Kind zu Hause auf die Online-Förderstunde vor?",
    "Otizmde erken belirtiler: Ailelerin dikkat etmesi gerekenler",
    "Yurt dışında iki dilli büyümek: Evde Türkçe konuşmaya devam etmeli miyim?",
    "Frühe Anzeichen von Autismus: Worauf Eltern achten sollten",
    "Zweisprachig aufwachsen: Soll ich zu Hause weiter Türkisch sprechen?",
    "Disleksinin ilk işaretleri: Okula başlarken nelere dikkat etmeli?",
    "Günlük rutinler çocuğunuza nasıl güven verir?",
    "Erste Anzeichen von Legasthenie: Worauf Sie zum Schulstart achten sollten",
    "Wie feste Tagesabläufe Ihrem Kind Sicherheit geben",
}
# artboard of each published article, used for links on the blog list page
POST_PAGE = {
    "Online özel eğitim dersine evde nasıl hazırlanılır?": "BlogYazi.dc.html",
    "Wie bereite ich mein Kind zu Hause auf die Online-Förderstunde vor?": "BlogYaziDe.dc.html",
    "Otizmde erken belirtiler: Ailelerin dikkat etmesi gerekenler": "BlogOtizm.dc.html",
    "Yurt dışında iki dilli büyümek: Evde Türkçe konuşmaya devam etmeli miyim?": "BlogIkiDil.dc.html",
    "Frühe Anzeichen von Autismus: Worauf Eltern achten sollten": "BlogOtizmDe.dc.html",
    "Zweisprachig aufwachsen: Soll ich zu Hause weiter Türkisch sprechen?": "BlogIkiDilDe.dc.html",
    "Disleksinin ilk işaretleri: Okula başlarken nelere dikkat etmeli?": "BlogDisleksi.dc.html",
    "Günlük rutinler çocuğunuza nasıl güven verir?": "BlogRutin.dc.html",
    "Erste Anzeichen von Legasthenie: Worauf Sie zum Schulstart achten sollten": "BlogDisleksiDe.dc.html",
    "Wie feste Tagesabläufe Ihrem Kind Sicherheit geben": "BlogRutinDe.dc.html",
}

# fonts are served from this site (no request to Google's servers)
FONT_LINK_RE = re.compile(r'<link rel="stylesheet" href="https://fonts\.googleapis\.com/[^"]*">')
def font_css(prefix):
    return ("<style>"
            f"@font-face{{font-family:'Bricolage Grotesque';src:url('{prefix}assets/fonts/bricolage-grotesque.woff2') format('woff2');font-weight:500 700;font-style:normal;font-display:swap}}"
            f"@font-face{{font-family:'Inter';src:url('{prefix}assets/fonts/inter.woff2') format('woff2');font-weight:400 600;font-style:normal;font-display:swap}}"
            "</style>")
UPCOMING = {
    "tr": ("Hazırlanan yazılar", "Bu yazılar hazırlanıyor; yakında burada yayımlanacak."),
    "de": ("Beiträge in Vorbereitung", "Diese Beiträge werden gerade vorbereitet und erscheinen in Kürze hier."),
}
CARD_RE = re.compile(r'<a ((?:data-cat="[^"]*" )?)href="[^"]+" (style="display: flex; flex-direction: column;[^"]*")>(.*?)</a>\n?', re.S)

MENU_SCRIPT = """<script>
document.querySelectorAll('.mob-menu a').forEach(function (a) {
  a.addEventListener('click', function () { a.closest('details').removeAttribute('open'); });
});
</script>"""

POSTS = {
    "tr": {
        "all": "Tümü",
        "cats": ["Otizm", "Disleksi", "Aile", "Online eğitim", "İki dillilik"],
        "group": "Kategoriye göre filtrele",
        "suffix": ("yazı", "yazı"),
        "posts": [
            ("Online eğitim", "Online özel eğitim dersine evde nasıl hazırlanılır?", "Sabit bir köşe, düzenli bir saat ve birkaç tanıdık materyal. Online dersten en iyi verimi almak için küçük ama etkili hazırlıklar."),
            ("Otizm", "Otizmde erken belirtiler: Ailelerin dikkat etmesi gerekenler", "Göz teması, sosyal etkileşim ve tekrarlayan davranışlar. Hangi işaretler bir uzmana danışmak için sebep olmalı?"),
            ("İki dillilik", "Yurt dışında iki dilli büyümek: Evde Türkçe konuşmaya devam etmeli miyim?", "Pek çok aile, iki dilin çocuğun dil gelişimini yavaşlatacağından endişe ediyor. Araştırmalar ne diyor, evde neler yapabilirsiniz?"),
            ("Disleksi", "Disleksinin ilk işaretleri: Okula başlarken nelere dikkat etmeli?", "Harfleri karıştırma, yavaş okuma ve sık yazım hataları. Erken fark etmenin çocuğunuza sağlayacağı avantajlar."),
            ("Aile", "Günlük rutinler çocuğunuza nasıl güven verir?", "Öngörülebilir bir gün, otizmli çocuklar için güvenli bir zemin olabilir. Evde rutin oluşturmanın pratik yolları."),
        ],
    },
    "de": {
        "all": "Alle",
        "cats": ["Autismus", "Legasthenie", "Familie", "Online-Förderung", "Zweisprachigkeit"],
        "group": "Nach Kategorie filtern",
        "suffix": ("Beitrag", "Beiträge"),
        "posts": [
            ("Online-Förderung", "Wie bereite ich mein Kind zu Hause auf die Online-Förderstunde vor?", "Ein fester Platz, eine feste Uhrzeit und ein paar vertraute Materialien: kleine, aber wirkungsvolle Vorbereitungen für die Online-Stunde."),
            ("Autismus", "Frühe Anzeichen von Autismus: Worauf Eltern achten sollten", "Blickkontakt, soziale Interaktion und sich wiederholende Verhaltensweisen. Welche Anzeichen sind ein Grund, fachlichen Rat einzuholen?"),
            ("Zweisprachigkeit", "Zweisprachig aufwachsen: Soll ich zu Hause weiter Türkisch sprechen?", "Viele Eltern befürchten, dass zwei Sprachen die Sprachentwicklung verlangsamen. Was sagt die Forschung, und was können Sie zu Hause tun?"),
            ("Legasthenie", "Erste Anzeichen von Legasthenie: Worauf Sie zum Schulstart achten sollten", "Verwechselte Buchstaben, langsames Lesen und häufige Rechtschreibfehler. Warum es sich lohnt, früh hinzuschauen."),
            ("Familie", "Wie feste Tagesabläufe Ihrem Kind Sicherheit geben", "Ein vorhersehbarer Tag kann für Kinder im Autismus-Spektrum ein sicherer Rahmen sein. Praktische Wege zu festen Routinen zu Hause."),
        ],
    },
}

BTN_ON = "min-height: 44px; padding: 0 18px; border-radius: 999px; border: 1.5px solid #12312B; background: #12312B; color: #F4F6F3; font: 600 15px Inter, system-ui, sans-serif; cursor: pointer"
BTN_OFF = "min-height: 44px; padding: 0 18px; border-radius: 999px; border: 1.5px solid #C9D3CE; background: #FFFFFF; color: #12312B; font: 600 15px Inter, system-ui, sans-serif; cursor: pointer"

FAVICON = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><path d="M20 38.5 V14" fill="none" stroke="#12312B" stroke-width="2.2" stroke-linecap="round"/><path transform="translate(20 6.5) rotate(0)" d="M0 -6 C 2.4 -3, 2.4 3, 0 6 C -2.4 3, -2.4 -3, 0 -6 Z" fill="{ACCENT}"/><path transform="translate(16.2 12.9) rotate(-32)" d="M0 -6 C 2.4 -3, 2.4 3, 0 6 C -2.4 3, -2.4 -3, 0 -6 Z" fill="{ACCENT}"/><path transform="translate(23.8 12.9) rotate(32)" d="M0 -6 C 2.4 -3, 2.4 3, 0 6 C -2.4 3, -2.4 -3, 0 -6 Z" fill="{ACCENT}"/><path transform="translate(16.2 19.4) rotate(-32)" d="M0 -6 C 2.4 -3, 2.4 3, 0 6 C -2.4 3, -2.4 -3, 0 -6 Z" fill="{ACCENT}"/><path transform="translate(23.8 19.4) rotate(32)" d="M0 -6 C 2.4 -3, 2.4 3, 0 6 C -2.4 3, -2.4 -3, 0 -6 Z" fill="{ACCENT}"/><path transform="translate(16.2 25.9) rotate(-32)" d="M0 -6 C 2.4 -3, 2.4 3, 0 6 C -2.4 3, -2.4 -3, 0 -6 Z" fill="{ACCENT}"/><path transform="translate(23.8 25.9) rotate(32)" d="M0 -6 C 2.4 -3, 2.4 3, 0 6 C -2.4 3, -2.4 -3, 0 -6 Z" fill="{ACCENT}"/></svg>
'''


def rel_link(from_out, to_out):
    """Relative URL from one output file to another; index.html becomes its folder."""
    from_dir = os.path.dirname(from_out) or "."
    target_dir, target_file = os.path.split(to_out)
    if target_file == "index.html":
        r = os.path.relpath(target_dir or ".", from_dir)
        return "./" if r == "." else r.rstrip("/") + "/"
    return os.path.relpath(to_out, from_dir)


def build_blog_list(content, lang):
    data = POSTS[lang]
    pat = re.compile(
        r'<div role="group".*?</sc-for>\n</div>\n'
        r'<p (style="[^"]*")>\{\{ countLabel \}\}</p>\n'
        r'(<div style="display: grid[^"]*">)\n'
        r'<sc-for list="\{\{ posts \}\}"[^>]*>\n(.*?)\n</sc-for>\n</div>',
        re.S,
    )
    m = pat.search(content)
    assert m, "blog list block not found"
    count_style, grid_open, card_tpl = m.group(1), m.group(2), m.group(3)

    buttons = [f'<button type="button" data-filter="*" aria-pressed="true" style="{BTN_ON}">{data["all"]}</button>']
    for c in data["cats"]:
        buttons.append(f'<button type="button" data-filter="{html.escape(c)}" aria-pressed="false" style="{BTN_OFF}">{c}</button>')

    published = [p for p in data["posts"] if p[1] in REAL_TITLES]
    featured = published[0][1] if published else None
    rest = [p for p in published if p[1] != featured]
    upcoming = [p for p in data["posts"] if p[1] not in REAL_TITLES]

    head, sub = UPCOMING[lang]
    up_html = ""
    if upcoming:
        rows = "\n".join(
            f'<li style="display: flex; flex-wrap: wrap; align-items: baseline; gap: 4px 20px; padding: 16px 0; border-bottom: 1px solid #C9D3CE">'
            f'<span style="flex: 0 0 170px; font-size: 13px; font-weight: 600; letter-spacing: 0.06em; text-transform: uppercase; color: #3E5650">{cat}</span>'
            f'<span style="flex: 1 1 280px; font-weight: 500">{title}</span></li>'
            for cat, title, _ in upcoming)
        up_html = (
            f'<div style="margin-top: {"72px" if rest else "0"}">\n'
            f'<h2 style="margin: 0; font-family: \'Bricolage Grotesque\', sans-serif; font-weight: 600; font-size: clamp(22px, 2.4vw, 28px); letter-spacing: -0.01em">{head}</h2>\n'
            f'<p style="margin: 8px 0 0; font-size: 16px; color: #3E5650">{sub}</p>\n'
            f'<ul style="list-style: none; margin: 24px 0 0; padding: 0; border-top: 1px solid #C9D3CE">\n{rows}\n</ul>\n</div>'
        )

    if not rest:
        content = content[:m.start()] + up_html + content[m.end():]
        return content, ""

    cats_present = [c for c in data["cats"] if any(p[0] == c for p in rest)]
    buttons = buttons[:1] + [b for b in buttons[1:] if any(f'data-filter="{html.escape(c)}"' in b for c in cats_present)]

    cards = []
    for cat, title, excerpt in rest:
        card = (card_tpl.replace("{{ p.cat }}", cat)
                        .replace("{{ p.title }}", title)
                        .replace("{{ p.excerpt }}", excerpt))
        card = re.sub(r'<a href="[^"]+"', f'<a data-cat="{html.escape(cat)}" href="{POST_PAGE[title]}"', card, count=1)
        cards.append(card)

    n = len(rest)
    block = (
        f'<div role="group" aria-label="{data["group"]}" style="display: flex; flex-wrap: wrap; gap: 10px">\n'
        + "\n".join(buttons) + "\n</div>\n"
        + f'<p id="post-count" {count_style} aria-live="polite">{n} {data["suffix"][1]}</p>\n'
        + grid_open + "\n" + "\n".join(cards) + "\n</div>\n" + up_html
    )
    content = content[:m.start()] + block + content[m.end():]

    script = f"""<script>
(function () {{
  var ON = {BTN_ON!r}, OFF = {BTN_OFF!r};
  var one = {data["suffix"][0]!r}, many = {data["suffix"][1]!r};
  var buttons = document.querySelectorAll('[data-filter]');
  var cards = document.querySelectorAll('[data-cat]');
  var count = document.getElementById('post-count');
  function apply(cat) {{
    var n = 0;
    cards.forEach(function (c) {{
      var show = cat === '*' || c.getAttribute('data-cat') === cat;
      c.hidden = !show;
      if (show) n++;
    }});
    buttons.forEach(function (b) {{
      var active = b.getAttribute('data-filter') === cat;
      b.setAttribute('aria-pressed', active ? 'true' : 'false');
      b.setAttribute('style', active ? ON : OFF);
    }});
    count.textContent = n + ' ' + (n === 1 ? one : many);
  }}
  buttons.forEach(function (b) {{
    b.addEventListener('click', function () {{ apply(b.getAttribute('data-filter')); }});
  }});
}})();
</script>"""
    return content, script


def drop_unpublished_cards(content):
    """Remove cards for articles that do not exist yet; drop a 'related' block left empty."""
    def title_of(inner):
        t = re.search(r"<h3[^>]*>(.*?)</h3>", inner, re.S)
        return html.unescape(t.group(1)).strip() if t else None

    def repl(m):
        t = title_of(m.group(3))
        return m.group(0) if t is None or t in REAL_TITLES else ""

    content = CARD_RE.sub(repl, content)

    # related-articles section with no cards left
    def related(m):
        return m.group(0) if CARD_RE.search(m.group(0)) else ""
    content = re.sub(r'<section aria-labelledby="(?:ilgili|weiterlesen)".*?</section>\n?', related, content, flags=re.S)

    # a lone card on the home page should not stretch across the whole row
    blog = re.search(r'<section id="blog".*?</section>', content, re.S)
    if blog and len(CARD_RE.findall(blog.group(0))) == 1:
        sec = CARD_RE.sub(lambda m: m.group(0).replace('style="display: flex; flex-direction: column;', 'style="max-width: 640px; display: flex; flex-direction: column;', 1), blog.group(0))
        content = content[:blog.start()] + sec + content[blog.end():]
    return content


def page_url(src_name):
    path = PAGES[src_name][0]
    if path.endswith("index.html"):
        path = path[: -len("index.html")]
    return SITE_URL + path


def seo_head(src_name, lang, title, desc):
    """canonical, hreflang, Open Graph and JSON-LD for one page."""
    url = page_url(src_name)
    other = COUNTERPART.get(src_name)
    tr_name = src_name if lang == "tr" else other
    image = SITE_URL + f"assets/og/hasat-{lang}.png"
    esc = lambda v: html.escape(v, quote=True)
    out = [f'<link rel="canonical" href="{url}">']
    if other:
        out.append(f'<link rel="alternate" hreflang="{lang}" href="{url}">')
        out.append(f'<link rel="alternate" hreflang="{"de" if lang == "tr" else "tr"}" href="{page_url(other)}">')
        out.append(f'<link rel="alternate" hreflang="x-default" href="{page_url(tr_name)}">')
    is_article = src_name in ARTICLE_DATES
    out += [
        f'<meta property="og:type" content="{"article" if is_article else "website"}">',
        f'<meta property="og:site_name" content="{SITE_NAME}">',
        f'<meta property="og:title" content="{esc(title)}">',
        f'<meta property="og:description" content="{esc(desc)}">',
        f'<meta property="og:url" content="{url}">',
        f'<meta property="og:locale" content="{"tr_TR" if lang == "tr" else "de_DE"}">',
        f'<meta property="og:locale:alternate" content="{"de_DE" if lang == "tr" else "tr_TR"}">',
        f'<meta property="og:image" content="{image}">',
        '<meta property="og:image:width" content="1200">',
        '<meta property="og:image:height" content="630">',
        f'<meta property="og:image:alt" content="{esc(SITE_NAME)}">',
        '<meta name="twitter:card" content="summary_large_image">',
    ]
    org = {
        "@type": "EducationalOrganization",
        "@id": SITE_URL + "#organization",
        "name": SITE_NAME,
        "url": SITE_URL,
        "logo": SITE_URL + "assets/logo/hasat-profil-fotografi.png",
        "email": "hasatozelegitim@gmail.com",
        "telephone": "+905419713092",
        "address": {"@type": "PostalAddress", "streetAddress": "Girne Mahallesi, Girne Bulvarı, Aybüke Sitesi A Blok No: 76, Zemin Kat", "postalCode": "09100", "addressLocality": "Efeler", "addressRegion": "Aydın", "addressCountry": "TR"},
        "areaServed": ["TR", "DE"],
        "knowsLanguage": ["tr"],
        "employee": {"@type": "Person", "name": "Hanife Tetik",
                     "jobTitle": "Özel Eğitim Uzmanı" if lang == "tr" else "Sonderpädagogin"},
    }
    graph = None
    if src_name in HOME_PAGES:
        graph = [org, {"@type": "WebSite", "@id": SITE_URL + "#website", "url": SITE_URL, "name": SITE_NAME,
                       "inLanguage": ["tr", "de"], "publisher": {"@id": SITE_URL + "#organization"}}]
    elif is_article:
        out.append(f'<meta property="article:published_time" content="{ARTICLE_DATES[src_name]}">')
        graph = [{"@type": "BlogPosting", "headline": title, "description": desc, "inLanguage": lang,
                  "datePublished": ARTICLE_DATES[src_name], "dateModified": ARTICLE_DATES[src_name],
                  "mainEntityOfPage": url, "image": image,
                  "author": {"@type": "Person", "name": "Hanife Tetik",
                             "jobTitle": "Özel Eğitim Uzmanı" if lang == "tr" else "Sonderpädagogin"},
                  "publisher": {"@type": "Organization", "@id": SITE_URL + "#organization", "name": SITE_NAME,
                                "logo": {"@type": "ImageObject", "url": SITE_URL + "assets/logo/hasat-profil-fotografi.png"}}}]
    if graph:
        data = json.dumps({"@context": "https://schema.org", "@graph": graph}, ensure_ascii=False)
        out.append(f'<script type="application/ld+json">{data}</script>')
    return "\n".join(out)


def write_sitemap():
    ns = 'xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml"'
    rows = []
    for name, (_, lang, _) in PAGES.items():
        alt = ""
        other = COUNTERPART.get(name)
        if other:
            tr_name = name if lang == "tr" else other
            alt = (f'\n    <xhtml:link rel="alternate" hreflang="{lang}" href="{page_url(name)}"/>'
                   f'\n    <xhtml:link rel="alternate" hreflang="{"de" if lang == "tr" else "tr"}" href="{page_url(other)}"/>'
                   f'\n    <xhtml:link rel="alternate" hreflang="x-default" href="{page_url(tr_name)}"/>')
        lastmod = ARTICLE_DATES.get(name, LASTMOD)
        rows.append(f"  <url>\n    <loc>{page_url(name)}</loc>\n    <lastmod>{lastmod}</lastmod>{alt}\n  </url>")
    with open(os.path.join(OUT, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write(f'<?xml version="1.0" encoding="UTF-8"?>\n<urlset {ns}>\n' + "\n".join(rows) + "\n</urlset>\n")
    with open(os.path.join(OUT, "robots.txt"), "w", encoding="utf-8") as f:
        f.write(f"User-agent: *\nAllow: /\n\nSitemap: {SITE_URL}sitemap.xml\n")
    cname = os.path.join(OUT, "CNAME")
    if CUSTOM_DOMAIN:
        with open(cname, "w") as f:
            f.write(CUSTOM_DOMAIN + "\n")
    elif os.path.exists(cname):
        os.remove(cname)


def convert(src_name, out_path, lang, desc):
    src = open(os.path.join(SRC, src_name), encoding="utf-8").read()
    title = re.search(r"<title>(.*?)</title>", src, re.S).group(1).strip()
    xdc = re.search(r"<x-dc>(.*)</x-dc>", src, re.S).group(1)
    helmet = re.search(r"<helmet>(.*?)</helmet>", xdc, re.S).group(1).strip()
    content = re.sub(r"<helmet>.*?</helmet>", "", xdc, count=1, flags=re.S).strip()

    script = ""
    if "{{ posts }}" in content:
        content, script = build_blog_list(content, lang)
    content = drop_unpublished_cards(content)

    for part in ("helmet", "content"):
        pass
    helmet = helmet.replace("{{accent}}", ACCENT)
    content = content.replace("{{accent}}", ACCENT)

    def fix_href(m):
        target, frag = m.group(1), m.group(2) or ""
        out_target = PAGES[target][0]
        return f'href="{rel_link(out_path, out_target)}{frag}"'

    content = re.sub(r'href="([A-Za-z]+\.dc\.html)(#[^"]*)?"', fix_href, content)

    leftovers = re.findall(r"\{\{|<sc-|\.dc\.html|DCLogic", content)
    assert not leftovers, f"{src_name}: unconverted markup {set(leftovers)}"

    depth_prefix = os.path.relpath(".", os.path.dirname(out_path) or ".")
    prefix = "" if depth_prefix == "." else depth_prefix + "/"
    favicon_href = prefix + "favicon.svg"
    assert len(FONT_LINK_RE.findall(helmet)) == 1, f"{src_name}: font link not found"
    helmet = FONT_LINK_RE.sub(lambda m: font_css(prefix), helmet)
    alt_tr = alt_de = None
    page = f"""<!doctype html>
<html lang="{lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{title}</title>
<meta name="description" content="{html.escape(desc, quote=True)}">
{seo_head(src_name, lang, title.split(" · ")[0] if src_name in ARTICLE_DATES else title, desc)}
<meta name="theme-color" content="#12312B">
<link rel="icon" href="{favicon_href}" type="image/svg+xml">
<link rel="apple-touch-icon" href="{prefix}assets/apple-touch-icon.png">
<link rel="preload" href="{prefix}assets/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>
{helmet}
<style>[hidden]{{display:none !important}}html{{scroll-behavior:smooth}}</style>
</head>
<body>
{content}
{script}
{MENU_SCRIPT}
</body>
</html>
"""
    dest = os.path.join(OUT, out_path)
    os.makedirs(os.path.dirname(dest) or OUT, exist_ok=True)
    with open(dest, "w", encoding="utf-8") as f:
        f.write(page)
    print(f"{src_name:22s} -> {out_path}")


os.makedirs(OUT, exist_ok=True)
for name, (out_path, lang, desc) in PAGES.items():
    convert(name, out_path, lang, desc)
with open(os.path.join(OUT, "favicon.svg"), "w", encoding="utf-8") as f:
    f.write(FAVICON)
open(os.path.join(OUT, ".nojekyll"), "w").close()
write_sitemap()
print("done")
