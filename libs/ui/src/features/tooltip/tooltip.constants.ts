/**
 * How long after a touch tap the focus it hands over is still recognised as the
 * tap's own, and not a keyboard's. Generous enough to cover a slow tap-to-focus
 * sequence, short enough that a keyboard user following a tap is served.
 */
export const TOUCH_HANDOVER_WINDOW_MS = 700;

/** Attribute a delegated tooltip reads its content from, and matches its items by. */
export const DEFAULT_TOOLTIP_CONTENT_ATTRIBUTE = 'data-tooltip';
