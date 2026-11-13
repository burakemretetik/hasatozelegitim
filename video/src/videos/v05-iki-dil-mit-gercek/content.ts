// Exact on-screen Turkish text from SCRIPT.md, split into lines for layout.

export type Seg = {t: string; hl?: boolean};

export const HOOK: Array<{t: string; accent?: boolean}> = [
  {t: 'Yurt dışında çocuk'},
  {t: 'büyütüyorsanız'},
  {t: 'bunları muhtemelen', accent: true},
  {t: 'duymuşsunuzdur.', accent: true},
];

export const TITLE = {top: 'İki dillilik hakkında', num: '3', bottom: 'yanlış bilinen'};

export type CardText = {myth: string[]; fact: Seg[][]; factSize: number};

export const CARDS: CardText[] = [
  {
    myth: ['İki dil,', 'konuşmayı', 'geciktirir.'],
    fact: [
      [{t: 'İki dille büyüyen'}],
      [{t: 'çocuklar ilk'}],
      [{t: 'kelimelerini ve ilk'}],
      [{t: 'cümlelerini tek dille'}],
      [{t: 'büyüyenlerle '}, {t: 'aynı', hl: true}],
      [{t: 'yaş aralığında', hl: true}, {t: ' söyler.'}],
    ],
    factSize: 64,
  },
  {
    myth: ['İki dili', 'karıştırıyorsa', 'kafası', 'karışmıştır.'],
    fact: [
      [{t: 'Dilleri zaman zaman'}],
      [{t: 'karıştırmak,'}],
      [{t: 'iki dilli gelişimin'}],
      [{t: 'doğal bir parçasıdır', hl: true}, {t: '.'}],
    ],
    factSize: 70,
  },
  {
    myth: ['Otizmli', 'çocuklar için', 'tek dil', 'daha iyidir.'],
    fact: [
      [{t: 'Araştırmalar, iki dille'}],
      [{t: 'büyüyen otizmli'}],
      [{t: 'çocukların dil'}],
      [{t: 'becerilerinde tek dille'}],
      [{t: 'büyüyenlere göre'}],
      [{t: 'bir gerilik bulmadı', hl: true}, {t: '.'}],
    ],
    factSize: 64,
  },
];

export const CLOSING: Seg[][] = [
  [{t: 'Evde '}, {t: 'en rahat', hl: true}],
  [{t: 'olduğunuz dilde', hl: true}],
  [{t: 'konuşmaya'}],
  [{t: 'devam edin.'}],
];

export const SOURCES = ['Hambly ve Fombonne (2012);', 'Petersen ve ark. (2012); Digard ve ark. (2023)'];

export const OUTRO_LINE = 'Yazının tamamı blogumuzda.';
