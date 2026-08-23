/** Pointer travel in px beyond which a press becomes a drag rather than a click. */
export const CAROUSEL_DRAG_START_SLOP = 10;

/**
 * How far horizontal travel must outweigh vertical before the drag locks onto
 * the carousel. Above 1 an ambiguous diagonal stays with the browser, so a page
 * scroll that starts across a slide still scrolls.
 */
export const CAROUSEL_DRAG_LOCK_RATIO = 1.5;

/** Fraction of the viewport width a drag must cover to commit to the neighbouring slide. */
export const CAROUSEL_SWIPE_THRESHOLD_RATIO = 0.2;

/** Release velocity in px/ms that commits to the neighbouring slide however short the travel. */
export const CAROUSEL_FLICK_VELOCITY = 0.4;

/**
 * Divisor damping drag travel that has nothing to reveal — the track is already
 * at the edge — so the gesture resists instead of pulling empty space into view.
 */
export const CAROUSEL_EDGE_DRAG_RESISTANCE = 4;

/**
 * Window in ms after a drag within which a click is swallowed as that drag's
 * tail. Self-expiring, so a drag that ends without a click (the pointer left the
 * window) cannot leave a later genuine click suppressed.
 */
export const CAROUSEL_CLICK_SUPPRESSION_WINDOW = 300;
