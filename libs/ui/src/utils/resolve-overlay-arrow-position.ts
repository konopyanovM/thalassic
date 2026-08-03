import { ConnectedPosition } from '@angular/cdk/overlay';
import { OVERLAY_ARROW_BLOCK_ALIGNMENT_MAP } from '../constants';
import { OverlayArrowPosition } from '../types';

/**
 * Derives where an arrow belongs from the connection pair the overlay actually settled on,
 * so a panel that fell back to another position moves its arrow with it.
 *
 * The arrow sits on the panel edge facing the origin: an overlay anchored by its bottom edge
 * hangs above the origin and points down from its own bottom. An overlay pinned by one of its
 * edges extends away from that edge, so the origin — and with it the arrow — stays near the
 * pinned end. Axes stay logical (`start` / `end` rather than left / right), so the result flips
 * with the layout direction on its own.
 *
 * A pair that places the overlay neither above/below nor beside the origin — one covering its
 * origin, for instance — has no edge to point from and resolves to `null`.
 */
export const resolveOverlayArrowPosition = (
  connectionPair: Pick<ConnectedPosition, 'originX' | 'originY' | 'overlayX' | 'overlayY'>,
): OverlayArrowPosition | null => {
  const { originX, originY, overlayX, overlayY } = connectionPair;

  const isStacked =
    (originY === 'top' && overlayY === 'bottom') || (originY === 'bottom' && overlayY === 'top');
  if (isStacked) return { side: overlayY === 'bottom' ? 'bottom' : 'top', alignment: overlayX };

  const isBeside =
    (originX === 'start' && overlayX === 'end') || (originX === 'end' && overlayX === 'start');
  if (isBeside) {
    return {
      side: overlayX === 'end' ? 'end' : 'start',
      alignment: OVERLAY_ARROW_BLOCK_ALIGNMENT_MAP[overlayY],
    };
  }

  return null;
};
