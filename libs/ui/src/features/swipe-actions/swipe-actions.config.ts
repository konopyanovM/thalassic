export interface SwipeActionsConfig {
  /** Width in px of a fully revealed action panel. */
  revealWidth: number;
  /** Travel in px past which releasing the pointer commits the action. */
  commitThreshold: number;
  /** Velocity in px/ms past which a flick commits regardless of travel. */
  flickVelocity: number;
  /**
   * Pointer types allowed to drive the gesture. Swiping is a touch idiom;
   * mouse users have the visible controls, and a mouse drag over a row
   * competes with text selection.
   */
  pointerTypes: readonly string[];
}

export const DEFAULT_SWIPE_ACTIONS_CONFIG: SwipeActionsConfig = {
  revealWidth: 96,
  commitThreshold: 72,
  flickVelocity: 0.5,
  pointerTypes: ['touch', 'pen'],
};
