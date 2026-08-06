import { color } from '../../../types';

/** The theme colors plus `golden` — the classic star gold, exclusive to the rating. */
export type ratingColor = color | 'golden';

/**
 * Context object exposed to a consumer-provided star template slot. The slot
 * replaces the built-in star icon; each star renders the template twice — once
 * as the empty layer and once inside the fill layer, which is clipped to the
 * star's filled share — so both states must come from the same template.
 */
export interface RatingStarContext {
  /** 1-based position of the star in the row. */
  $implicit: number;
  /** Whether this copy renders a filled layer rather than the empty one. */
  filled: boolean;
  /** Whether this copy renders inside the tentative hover-preview layer rather than the committed fill. */
  preview: boolean;
  /** Whether the displayed value fills this star only partially — e.g. the third star at 2.5. */
  half: boolean;
}
