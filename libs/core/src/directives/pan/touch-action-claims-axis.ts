/** `touch-action` tokens that leave pans along each axis to the browser. */
const HORIZONTAL_PAN_TOKENS = ['pan-x', 'pan-left', 'pan-right'];
const VERTICAL_PAN_TOKENS = ['pan-y', 'pan-up', 'pan-down'];

/**
 * Whether a computed `touch-action` value withholds pans along `axis` from the browser.
 *
 * An element that scrolls nothing but drives a gesture of its own (a swipe surface, a drag
 * handle) declares exactly this, so the claim marks where a surrounding gesture must stand
 * aside the same way native scrolling does. An engine that does not resolve the property (an
 * empty or absent value) reads as the initial `auto`, claiming nothing.
 */
export const touchActionClaimsAxis = (
  touchAction: string | undefined,
  axis: 'x' | 'y',
): boolean => {
  if (!touchAction || touchAction === 'auto' || touchAction === 'manipulation') return false;
  if (touchAction === 'none') return true;

  const allowingTokens = axis === 'x' ? HORIZONTAL_PAN_TOKENS : VERTICAL_PAN_TOKENS;
  return !touchAction.split(' ').some(token => allowingTokens.includes(token));
};
