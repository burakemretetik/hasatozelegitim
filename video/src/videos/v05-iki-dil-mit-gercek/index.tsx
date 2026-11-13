import React, {useEffect, useState} from 'react';
import {AbsoluteFill, continueRender, delayRender} from 'remotion';
import {C, FONT} from '../../shared/brand';

export const meta = {id: 'v05', durationInFrames: 300, coverFrame: 0};

const TESTS: Array<[string, string]> = [
  ['600 100px "Bricolage Grotesque"', 'İki dille büyüyen|çocuklar ilk|çocuklar ilk kelimelerini|kelimelerini ve ilk|ve ilk cümlelerini|cümlelerini tek dille|tek dille büyüyenlerle|büyüyenlerle aynı|aynı yaş aralığında|yaş aralığında söyler.|aynı yaş aralığında söyler.|İki dille büyüyen çocuklar ilk|büyüyen otizmli çocukların|dil becerilerinde|tek dille büyüyenlere|göre bir gerilik bulmadı.|karıştırmak, iki dilli gelişimin|doğal bir parçasıdır.|Dilleri zaman zaman karıştırmak,|iki dilli gelişimin|ilk kelimelerini ve|ilk cümlelerini'],
  ['650 100px "Bricolage Grotesque"', 'tek dil|daha iyidir.|kafası|karışmıştır.|İki dillilik|hakkında'],
  ['800 100px "Bricolage Grotesque"', '3'],
];

export const Video: React.FC = () => {
  const [res, setRes] = useState<string[]>([]);
  const [h] = useState(() => delayRender('measure'));
  useEffect(() => {
    document.fonts.ready.then(async () => {
      for (const [f] of TESTS) await document.fonts.load(f, 'İğşı');
      const cv = document.createElement('canvas');
      const ctx = cv.getContext('2d')!;
      const out: string[] = [];
      for (const [f, s] of TESTS) {
        ctx.font = f;
        out.push('## ' + f);
        for (const str of s.split('|')) out.push(`${Math.round(ctx.measureText(str).width)}  ${str}`);
      }
      setRes(out);
      continueRender(h);
    });
  }, [h]);
  return (
    <AbsoluteFill style={{background: '#fff', color: C.green, fontFamily: FONT.mono, fontSize: 30, padding: 30, lineHeight: 1.18}}>
      {res.map((r, i) => <div key={i}>{r}</div>)}
    </AbsoluteFill>
  );
};
