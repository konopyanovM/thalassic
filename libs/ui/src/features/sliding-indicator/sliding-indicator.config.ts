import { orientation } from '../../types';

/**
 * Along which axes the mark of a chosen item travels to the item chosen next,
 * rather than leaving one and appearing on the other.
 *
 * Along a row the move is short and the eye follows it. Down a column it is a
 * bar the width of the list sweeping across every row between the two, more
 * motion than a change of selection calls for — and the lists a platform draws
 * mark a new row in place — so a column stays still unless asked otherwise.
 * Turning an axis on does not widen when the move plays: it is expressive
 * motion and is left out below the `full` motion level whatever is set here.
 */
export type SlidingIndicatorConfig = Record<orientation, boolean>;

export const DEFAULT_SLIDING_INDICATOR_CONFIG: SlidingIndicatorConfig = {
  horizontal: true,
  vertical: false,
};
