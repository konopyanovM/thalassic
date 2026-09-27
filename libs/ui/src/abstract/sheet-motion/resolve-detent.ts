import { DRAG_DISMISS_RATIO, SWIPE_DEFAULT_MIN_VELOCITY } from '@thalassic/core';

/**
 * Which detent a released drag settles on, among `heights` (ascending, one per
 * detent), having started at `startIndex` and let go at `releaseHeight` with
 * `velocity` px/ms toward a larger height.
 *
 * A flick decides, whichever way it points, and moves one detent from where
 * the drag began — never skipping one, so a hard flick from the bottom of a
 * three-detent sheet lands on the middle. Failing a flick, distance decides:
 * the nearest detent beyond the start wins, except that leaving the start detent takes the
 * same share of the gap a drag-to-dismiss commits at, so a short slow drag
 * snaps back.
 */
export function resolveDetent(
  heights: readonly number[],
  startIndex: number,
  releaseHeight: number,
  velocity: number,
): number {
  const last = heights.length - 1;
  if (velocity >= SWIPE_DEFAULT_MIN_VELOCITY) return Math.min(last, startIndex + 1);
  if (-velocity >= SWIPE_DEFAULT_MIN_VELOCITY) return Math.max(0, startIndex - 1);

  const start = heights[startIndex];
  const direction = releaseHeight > start ? 1 : releaseHeight < start ? -1 : 0;
  if (direction === 0) return startIndex;

  const neighbour = startIndex + direction;
  if (neighbour < 0 || neighbour > last) return startIndex;

  const gap = heights[neighbour] - start;
  if ((releaseHeight - start) / gap < DRAG_DISMISS_RATIO) return startIndex;

  // Past the bias: the nearest detent from the neighbour onward in this direction.
  // A tie goes to the farther detent, as every boundary here resolves in the drag's favour.
  let winner = neighbour;
  for (let index = neighbour; index >= 0 && index <= last; index += direction) {
    if (Math.abs(heights[index] - releaseHeight) > Math.abs(heights[winner] - releaseHeight)) break;
    winner = index;
  }
  return winner;
}
