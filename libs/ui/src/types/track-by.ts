import { TrackByFunction } from '@angular/core';

/**
 * Identity of an item in a repeated collection, expressed either as the key of the
 * property holding it or as an explicit function. Absent, a collection tracks by
 * item identity.
 */
export type TrackBy<T> = keyof T | TrackByFunction<T>;
