# Hasat Özel Eğitim

Türkiye ve yurt dışındaki ailelere Türkçe online özel eğitim ve aile danışmanlığı – Hanife Tetik.

Statik site, GitHub Pages ile yayınlanır (kaynak: `main` dalı, kök klasör).
Canlı adres: https://burakemretetik.github.io/hasatozelegitim/

| Sayfa | Dosya |
|---|---|
| Ana sayfa (TR) | `index.html` |
| Startseite (DE) | `de/index.html` |
| Blog (TR) | `blog/index.html` |
| Blog yazısı (TR) | `blog/online-ders-hazirligi.html` |
| Blog (DE) | `de/blog/index.html` |
| Blog-Beitrag (DE) | `de/blog/online-foerderstunde.html` |
| Yazı: Otizmde erken belirtiler | `blog/otizmde-erken-belirtiler.html` |
| Yazı: İki dilli büyümek | `blog/iki-dilli-buyumek.html` |
| Beitrag: Frühe Anzeichen von Autismus | `de/blog/fruehe-anzeichen-autismus.html` |
| Beitrag: Zweisprachig aufwachsen | `de/blog/zweisprachig-aufwachsen.html` |
| Künye / Gizlilik | `kunye/`, `gizlilik/` |
| Impressum / Datenschutz | `de/impressum/`, `de/datenschutz/` |

## Klasörler

- `tasarim/` – Sayfaların kaynağı: Claude Design tuvalindeki artboard'lar (`*.dc.html`) ve `canvas.json`.
  Tuval: https://claude.ai/artifact/6WUTUDWgip2s2xMRBLLq7v
- `araclar/build_site.py` – `tasarim/` içindeki artboard'ları sade HTML'e çevirir (bağlantıları düzeltir,
  blog filtresini statik HTML + küçük bir JS ile kurar, henüz yazılmamış yazıları "Yakında" kartı yapar,
  favicon ve meta etiketlerini ekler).
- `araclar/make_hasat.py` – Logo SVG'lerini (yazılar outline'a çevrilmiş) üretir. Bricolage Grotesque ve
  Inter `.ttf` dosyaları gerekir (google/fonts deposundan). `python3 araclar/make_hasat.py <fonts_klasoru> assets/logo`
- `assets/logo/` – Kesinleşmiş başak logosu (yatay, dikey, işaret, uygulama simgesi, profil fotoğrafı).
  `muhur/` ve `amblem/` yalnızca arşivdir, kullanılmıyor.

## Siteyi güncelleme

1. Tuvalde (ya da `tasarim/*.dc.html` dosyalarında) değişikliği yapın; tuval ile `tasarim/` aynı kalsın.
2. Siteyi yeniden üretin:
   ```
   python3 araclar/build_site.py tasarim .
   ```
3. Yeni bir blog yazısı eklerken: yazı sayfası için yeni artboard oluşturun, `build_site.py` içindeki
   `PAGES`, `POSTS` ve `REAL_TITLES` listelerine ekleyin. `REAL_TITLES` içinde olmayan yazılar ana sayfada ve
   yazı sonlarında gösterilmez; blog sayfasında "Hazırlanan yazılar" listesinde bağlantısız olarak görünür.
4. Commit edip `main`'e push'layın; GitHub Pages birkaç dakika içinde yayınlar.

## Renkler ve yazı tipleri

| Rol | Renk |
|---|---|
| Koyu yeşil (metin, koyu bölümler) | `#12312B` |
| Turuncu (vurgu, başak taneleri) | `#E8A33D` |
| Kırık beyaz (zemin) | `#F4F6F3` |
| İkincil metin | `#3E5650` |
| Açık panel | `#E3ECE7` |
| Çizgiler | `#D9E0DC` / `#C9D3CE` |

Başlıklar: Bricolage Grotesque (650). Metin: Inter. Yayındaki sitede ikisi de `assets/fonts/` klasöründen (Türkçe/Almanca alt kümesi, WOFF2, OFL lisanslı) yüklenir; Google'a istek gitmez. Tuval Google Fonts kullanır, derleme betiği bunu değiştirir.
