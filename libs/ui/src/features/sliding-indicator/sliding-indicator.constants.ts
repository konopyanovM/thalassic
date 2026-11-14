import { SlidingIndicatorBox } from './sliding-indicator.types';

/**
 * Marks a container whose indicator has been placed on the chosen item; the
 * theme's `sliding-indicator` mixin draws the indicator on it, and the item
 * gives up the mark it would otherwise draw itself.
 */
export const SLIDING_INDICATOR_ATTRIBUTE = 'data-sliding-indicator';

/** The indicator sits on its item, and follows it at once wherever the layout moves it. */
export const SLIDING_INDICATOR_PLACED = 'placed';

/** The indicator is on its way to an item newly chosen, which is the one move it animates. */
export const SLIDING_INDICATOR_TRAVELLING = 'travelling';

/** The chosen item's offset from the container's padding edge. */
export const SLIDING_INDICATOR_X_PROPERTY = '--tls-sliding-indicator-x';
export const SLIDING_INDICATOR_Y_PROPERTY = '--tls-sliding-indicator-y';

/** The chosen item's size. */
export const SLIDING_INDICATOR_WIDTH_PROPERTY = '--tls-sliding-indicator-width';
export const SLIDING_INDICATOR_HEIGHT_PROPERTY = '--tls-sliding-indicator-height';

/** Each side of the chosen item's box, with the property it is written to. */
export const SLIDING_INDICATOR_BOX_PROPERTIES: readonly [keyof SlidingIndicatorBox, string][] = [
  ['x', SLIDING_INDICATOR_X_PROPERTY],
  ['y', SLIDING_INDICATOR_Y_PROPERTY],
  ['width', SLIDING_INDICATOR_WIDTH_PROPERTY],
  ['height', SLIDING_INDICATOR_HEIGHT_PROPERTY],
];
