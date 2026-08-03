/**
 * Minimum count required for each activity level, ascending, covering levels 1…`levels - 1`
 * (level 0 is the empty day). Level 1 always starts at a single activity, so no active day
 * renders as empty, and the busiest day always reaches the top level; the levels in between
 * are spread evenly across that span.
 *
 * Returns an empty array when nothing is active, in which case every day resolves to level 0.
 */
export const buildActivityThresholds = (maxCount: number, levels: number): number[] => {
  if (maxCount <= 0) return [];

  const steps = levels - 1;
  const thresholds: number[] = [];

  for (let step = 1; step <= steps; step++) {
    const spread = steps === 1 ? 1 : Math.ceil(1 + ((maxCount - 1) * (step - 1)) / (steps - 1));
    const previous = thresholds[thresholds.length - 1];
    // Keep the thresholds strictly ascending when the busiest day has too few activities to
    // spread across every level; the surplus levels simply stay unreachable.
    thresholds.push(previous === undefined ? spread : Math.max(spread, previous + 1));
  }

  return thresholds;
};
