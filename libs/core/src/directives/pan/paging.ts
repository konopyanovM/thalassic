/** How a released paging drag is judged. */
export interface PagingRelease {
  /** How far the drag had carried the pages from rest when let go, in px. */
  offset: number;
  /** The speed it was let go at along the same axis, in px/ms. */
  velocity: number;
  /** The distance from one page to the next, in px. */
  extent: number;
  /** Share of `extent` a drag let go without a flick must have covered to step. */
  commitRatio: number;
  /** Speed in px/ms at which a release counts as a flick. */
  flickVelocity: number;
}

/**
 * Which way a released paging drag steps: `-1` or `1` to carry on that way
 * along the axis, `0` to go back to rest.
 *
 * A flick decides by its direction. The way the pages were already carried —
 * or from rest, a flick being over before anything is seen to move — it steps
 * however short the travel. Against the way they were carried it is a change
 * of mind, and the pages go back however far they had come: stepping on would
 * turn them against the finger that just threw them back. Without a flick, a
 * drag steps once it has covered `commitRatio` of the way to the next page.
 */
export function resolvePagingStep(release: PagingRelease): -1 | 0 | 1 {
  // Less than a pixel off rest is rest: a release can read a hair away from
  // the move before it, and that hair must not pass for a way the pages were
  // carried.
  const carried = Math.abs(release.offset) >= 1 ? Math.sign(release.offset) : 0;
  const flick =
    Math.abs(release.velocity) >= release.flickVelocity ? Math.sign(release.velocity) : 0;

  if (flick !== 0) {
    if (carried !== 0 && carried !== flick) return 0;

    return flick < 0 ? -1 : 1;
  }

  const covered =
    release.extent > 0 && Math.abs(release.offset) >= release.extent * release.commitRatio;
  if (!covered || carried === 0) return 0;

  return carried < 0 ? -1 : 1;
}

/**
 * How far the pages follow a drag of `offset` px: all the way where a page
 * lies that way, and only one part in `resistance` where none does — so the
 * end of the run stretches under the finger instead of pulling empty space
 * into view, or holding still as though the drag went unheard.
 */
export function resistPagingDrag(offset: number, open: boolean, resistance: number): number {
  return open ? offset : offset / resistance;
}
