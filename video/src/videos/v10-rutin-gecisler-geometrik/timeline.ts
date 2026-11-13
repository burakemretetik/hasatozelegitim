/** All timing constants for v10 (30 fps). Each scene's content starts after its wipe (IN). */
export const WIPE = 26; // length of the column-shutter wipe that opens every scene after the first
export const IN = 16; // first content animation inside a scene (wipe is mostly done by then)

export const DUR = {
  hook: 195,
  title: 135,
  tip1: 215,
  tip2: 160,
  tip3: 160,
  flex: 360,
  close: 195,
  outro: 105,
} as const;

export type SceneKey = keyof typeof DUR;
export const ORDER: SceneKey[] = ['hook', 'title', 'tip1', 'tip2', 'tip3', 'flex', 'close', 'outro'];

export const START: Record<SceneKey, number> = (() => {
  let t = 0;
  const out = {} as Record<SceneKey, number>;
  for (const k of ORDER) {
    out[k] = t;
    t += DUR[k];
  }
  return out;
})();

export const TOTAL = ORDER.reduce((s, k) => s + DUR[k], 0);
