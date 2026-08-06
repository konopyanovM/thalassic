import { color } from '../../types';

export type progressColor = color;

/**
 * Segment singled out for emphasis in a segmented track: a zero-based index,
 * `'latest'` for the frontmost segment the value has reached, or `null` for
 * none.
 */
export type progressActiveSegment = number | 'latest' | null;
