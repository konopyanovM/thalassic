/** Marks a host while its ink is expanding; the theme's `ripple` mixin animates on it. */
export const RIPPLE_ACTIVE_CLASS = 'tls-rippling';

/**
 * Marks a host whose contact has ended, so its ink fades out. Ink spreads and holds for as
 * long as the finger stays down — a held control keeps showing that it is pressed — and only
 * lets go when the contact does.
 */
export const RIPPLE_RELEASED_CLASS = 'tls-ripple-released';

/**
 * How long a touch waits before it inks. A finger landing on a control may be starting a
 * scroll, and ink struck at once would flash under every flick that happens to begin on
 * one; waiting out the first moments lets a scroll declare itself first. A tap lifted
 * sooner inks at once, so no tap goes unanswered. The value sits with Android's tap timeout
 * and MUI's touch-ripple delay, short enough not to read as lag.
 */
export const RIPPLE_TOUCH_DELAY_MS = 80;

/** Contact point of the press, relative to the host's own box. */
export const RIPPLE_X_PROPERTY = '--tls-ripple-x';
export const RIPPLE_Y_PROPERTY = '--tls-ripple-y';

/** Radius the ink has to reach to cover the host from that contact point. */
export const RIPPLE_DIAMETER_PROPERTY = '--tls-ripple-diameter';

/** Suppression hook the press mixin reads: 1 leaves the control at rest. */
export const PRESS_SCALE_PROPERTY = '--tls-press-scale';

/**
 * How far a pointer may travel before its press is read as the start of a scroll.
 * A ripple keeps expanding for its full duration, so one spawned by a flick stays
 * on screen well after the surface has moved — worse than a press, which ends
 * with the contact.
 */
export const RIPPLE_MOVE_SLOP_PX = 8;
