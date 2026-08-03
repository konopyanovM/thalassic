/**
 * Intensity step for `count` against ascending `thresholds` (the minimum count of each
 * level from 1 upwards): the highest level whose threshold the count reaches, or 0 when
 * it reaches none.
 */
export const resolveActivityLevel = (count: number, thresholds: number[]): number => {
  let level = 0;

  for (const threshold of thresholds) {
    if (count < threshold) break;
    level++;
  }

  return level;
};
