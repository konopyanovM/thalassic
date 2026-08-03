import { overlayArrowAlignment } from './overlay-arrow-alignment';
import { overlayArrowSide } from './overlay-arrow-side';

/** Placement of an overlay arrow, resolved from the position the overlay actually settled on. */
export interface OverlayArrowPosition {
  side: overlayArrowSide;
  alignment: overlayArrowAlignment;
}
