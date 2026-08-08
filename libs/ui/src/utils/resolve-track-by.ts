import { TrackByFunction } from '@angular/core';
import { TrackBy } from '../types';

/**
 * Resolves the shapes a `trackBy` input accepts into the function Angular's differs
 * expect: a property key becomes a lookup of that property, an explicit function
 * passes through, and an absent value falls back to tracking by item identity.
 */
export const resolveTrackBy = <T>(key: TrackBy<T> | undefined): TrackByFunction<T> => {
  if (key === undefined) return (_, item) => item;
  if (typeof key === 'function') return key;

  return (_, item) => item[key];
};
