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

/**
 * How long struck ink shows at full strength before a release may fade it. A tap is over
 * in a fraction of the spread, and ink that began fading the moment it appeared would be
 * gone before it had grown past the fingertip that covers it; holding it this long lets
 * the spread all but finish first. The value is Material Web's minimum press, and like
 * Angular Material's ripple — which fades only ink that has finished entering — it defers
 * the release rather than cutting the spread short.
 */
export const RIPPLE_MINIMUM_HOLD_MS = 225;

/** Contact point of the press, relative to the host's own box. */
export const RIPPLE_X_PROPERTY = '--tls-ripple-x';
export const RIPPLE_Y_PROPERTY = '--tls-ripple-y';

/** Radius the ink has to reach to cover the host from that contact point. */
export const RIPPLE_DIAMETER_PROPERTY = '--tls-ripple-diameter';

/** Suppression hook the press mixin reads: 1 leaves the control at rest. */
export const PRESS_SCALE_PROPERTY = '--tls-press-scale';

/**
 * How far a touch may travel, while it waits to ink, before it is read as the start of a
 * scroll and never inks. Ink already struck is not cancelled by travel: a finger shifting
 * on a control is still pressing it, and a contact the browser takes over for a scroll
 * ends with `pointercancel`, which fades the ink as a release does.
 */
export const RIPPLE_MOVE_SLOP_PX = 8;

/**
 * The `position` values that make an element positioned — the box its absolutely placed
 * descendants, the ink layer among them, are laid out against.
 */
export const POSITIONED_VALUES: ReadonlySet<string> = new Set(['relative', 'absolute', 'fixed', 'sticky']);
