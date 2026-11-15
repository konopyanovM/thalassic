import { describe, expect, it } from 'vitest';
import { settleCurve } from './settle-curve';
import { SETTLE_MAX_DURATION } from './sheet-motion.constants';

/** The easing's sampled progress values, in order. */
function points(easing: string): number[] {
  return easing
    .replace(/^linear\(|\)$/g, '')
    .split(', ')
    .map(Number);
}

describe('settleCurve', () => {
  it('has nothing to play for a travel under the rest distance', () => {
    expect(settleCurve(0.2, 3)).toEqual({ duration: 0, easing: 'linear' });
  });

  it('starts from rest and ends exactly on the target', () => {
    const { duration, easing } = settleCurve(300, 0);
    const progress = points(easing);

    expect(duration).toBe(450);
    expect(progress[0]).toBe(0);
    expect(progress[progress.length - 1]).toBe(1);
    // Gathers speed before it eases in: the second step outgrows the first.
    expect(progress[2] - progress[1]).toBeGreaterThan(progress[1] - progress[0]);
  });

  it('leaves faster for a launch toward the target, and never passes it', () => {
    const fromRest = points(settleCurve(300, 0).easing);
    const flicked = points(settleCurve(300, 5).easing);

    expect(flicked[1]).toBeGreaterThan(fromRest[1]);
    expect(Math.max(...flicked)).toBe(1);
  });

  it('reads the launch along the distance’s axis, whichever way it points', () => {
    expect(settleCurve(-300, -1.5)).toEqual(settleCurve(300, 1.5));
  });

  it('carries on away from the target first for a launch away from it', () => {
    const progress = points(settleCurve(40, -0.4).easing);

    expect(progress[1]).toBeLessThan(0);
    expect(progress[progress.length - 1]).toBe(1);
  });

  it('stops at the longest duration however far it travels', () => {
    expect(settleCurve(1e9, 0).duration).toBeLessThanOrEqual(SETTLE_MAX_DURATION + 17);
  });
});
