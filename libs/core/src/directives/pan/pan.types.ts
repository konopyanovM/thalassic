/** Axes a pan gesture is allowed to lock onto. */
export type panAxis = 'x' | 'y' | 'both';

/** Physical direction of travel along the gesture's dominant axis. */
export type panDirection = 'left' | 'right' | 'up' | 'down';

/**
 * Edge zone a gesture must start within. `start` / `end` are logical inline
 * edges: `start` is the left edge in LTR and the right edge in RTL.
 */
export type panEdge = 'start' | 'end' | 'top' | 'bottom';

/** Snapshot of an active pan gesture, carried by every pan lifecycle output. */
export interface PanEvent {
  /** Horizontal travel since the gesture started, in px (negative = left). */
  deltaX: number;
  /** Vertical travel since the gesture started, in px (negative = up). */
  deltaY: number;
  /** Euclidean distance travelled since the gesture started, in px. */
  distance: number;
  /** Horizontal velocity in px/ms, from a rolling sample window — not total distance over total time. */
  velocityX: number;
  /** Vertical velocity in px/ms, from a rolling sample window. */
  velocityY: number;
  /** Physical direction of travel. */
  direction: panDirection;
  /** Same as `direction` but flipped horizontally in RTL, so `right` always means inline-end. */
  logicalDirection: panDirection;
  /** The pointer type driving the gesture (`touch`, `pen`, `mouse`). */
  pointerType: string;
  /** The native pointer event the snapshot was derived from. */
  originalEvent: PointerEvent;
}

/** Summary of a completed swipe, emitted once when a pan release commits as a swipe. */
export interface SwipeEvent {
  /** Physical direction of the swipe. */
  direction: panDirection;
  /** Same as `direction` but flipped horizontally in RTL, so `right` always means inline-end. */
  logicalDirection: panDirection;
  /** Euclidean distance travelled by the underlying pan, in px. */
  distance: number;
  /** Horizontal release velocity in px/ms. */
  velocityX: number;
  /** Vertical release velocity in px/ms. */
  velocityY: number;
  /** The pointer type that drove the gesture (`touch`, `pen`, `mouse`). */
  pointerType: string;
  /** The native pointer event that ended the gesture. */
  originalEvent: PointerEvent;
}
