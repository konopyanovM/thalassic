import { overlayPosition } from '../types';

/**
 * Each placement mirrored to the opposite side of its origin, alignment kept: the one an
 * overlay falls back to first when its preferred side has no room.
 */
export const OVERLAY_FLIPPED_POSITION_MAP: Record<overlayPosition, overlayPosition> = {
  top: 'bottom',
  'top-start': 'bottom-start',
  'top-end': 'bottom-end',
  right: 'left',
  'right-start': 'left-start',
  'right-end': 'left-end',
  bottom: 'top',
  'bottom-start': 'top-start',
  'bottom-end': 'top-end',
  left: 'right',
  'left-start': 'right-start',
  'left-end': 'right-end',
  'top-left': 'bottom-left',
  'top-right': 'bottom-right',
  'bottom-left': 'top-left',
  'bottom-right': 'top-right',
};
