import { DRAG_DISMISS_RATIO, SWIPE_DEFAULT_MIN_VELOCITY } from '@thalassic/core';

/**
 * Whether a released drag commits to the state it was moving toward.
 *
 * A flick decides, whichever way it points: a short flick toward the target is
 * as clear an intent as a slow drag past the ratio, and a drag that reverses
 * into a flick reads as the flick. Only failing a flick does distance decide.
 * Requiring both a flick and the distance would strand each on its own.
 *
 * `velocity` is signed toward the commit direction in px/ms; `progress` is the
 * share of the extent travelled toward it, 0 to 1.
 */
export function decideCommit(velocity: number, progress: number): boolean {
  if (velocity >= SWIPE_DEFAULT_MIN_VELOCITY) return true;
  if (-velocity >= SWIPE_DEFAULT_MIN_VELOCITY) return false;

  return progress >= DRAG_DISMISS_RATIO;
}
