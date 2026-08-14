/**
 * The zoom at which the whole image fits the viewport, which is where the viewer
 * opens and what a reset returns to. Zoom is a multiple of that fitted size.
 */
export const FIT_ZOOM = 1;

/**
 * Zoom applied per unit of wheel delta, as an exponent (`e ^ (delta * factor)`),
 * which keeps the zoom ratio constant per notch at every zoom level.
 */
export const WHEEL_ZOOM_FACTOR = 0.0015;

/** Pixels a line-mode wheel notch is treated as, since `deltaY` then counts lines. */
export const WHEEL_LINE_HEIGHT = 16;

/** Pixels a page-mode wheel notch is treated as, since `deltaY` then counts pages. */
export const WHEEL_PAGE_HEIGHT = 400;

/** Pointer travel, in pixels, past which a press counts as a gesture and not a click. */
export const GESTURE_SLOP = 4;

/** Elements that already dispatch a click from Enter or Space on their own. */
export const NATIVELY_INTERACTIVE_TAGS = ['A', 'BUTTON'];
