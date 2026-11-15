import { RUBBER_BAND_RESISTANCE } from './sheet-motion.constants';

/**
 * How far a surface follows a pull of `overshoot` px past the end of its
 * travel: at first a fixed share of the finger's travel, then less and less,
 * approaching `limit` without reaching it. The stretch keeps giving, so the end
 * of the travel reads as elastic rather than as a wall the finger runs into.
 *
 * @example
 * rubberBand(20, 48);   // 8.9  — about half the finger's travel
 * rubberBand(100, 48);  // 25.6
 * rubberBand(1000, 48); // 44.1 — still short of the limit
 */
export function rubberBand(overshoot: number, limit: number): number {
  return limit * (1 - 1 / ((overshoot * RUBBER_BAND_RESISTANCE) / limit + 1));
}
