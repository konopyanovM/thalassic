import { describe, expect, it } from 'vitest';
import { rubberBand, rubberBandOvershoot } from './rubber-band';
import { RUBBER_BAND_RESISTANCE } from './sheet-motion.constants';

describe('rubberBand', () => {
  it('follows nothing of no overshoot', () => {
    expect(rubberBand(0, 48)).toBe(0);
  });

  it('starts at the resistance share of the finger’s travel', () => {
    expect(rubberBand(0.01, 48) / 0.01).toBeCloseTo(RUBBER_BAND_RESISTANCE, 3);
  });

  it('keeps giving, ever less, without reaching the limit', () => {
    const near = rubberBand(100, 48);
    const far = rubberBand(1000, 48);

    expect(far).toBeGreaterThan(near);
    expect(far - near).toBeLessThan(near);
    expect(rubberBand(1e9, 48)).toBeLessThan(48);
  });
});

describe('rubberBandOvershoot', () => {
  it('undoes the band: the overshoot that draws a stretch', () => {
    for (const overshoot of [0, 5, 60, 600]) {
      expect(rubberBandOvershoot(rubberBand(overshoot, 48), 48)).toBeCloseTo(overshoot, 6);
    }
  });

  it('reads a stretch at the limit as unbounded', () => {
    expect(rubberBandOvershoot(48, 48)).toBe(Number.POSITIVE_INFINITY);
    expect(rubberBand(rubberBandOvershoot(60, 48), 48)).toBe(48);
  });
});
