import { overlayArrowAlignment } from '../types';

/**
 * Block-axis anchoring of an overlay placed beside its origin, read as an arrow alignment along
 * that edge: an overlay pinned by its top edge grows downward, keeping the origin at its start.
 */
export const OVERLAY_ARROW_BLOCK_ALIGNMENT_MAP: Record<
  'top' | 'center' | 'bottom',
  overlayArrowAlignment
> = {
  top: 'start',
  center: 'center',
  bottom: 'end',
};
