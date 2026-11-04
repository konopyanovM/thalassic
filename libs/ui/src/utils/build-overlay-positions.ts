import { ConnectedPosition } from '@angular/cdk/overlay';
import { Point } from '@thalassic/core';
import { OVERLAY_FLIPPED_POSITION_MAP, OVERLAY_POSITION_MAP } from '../constants';
import { overlayPosition } from '../types';

/**
 * The placements an overlay tries, in order: the preferred one, then the same placement
 * mirrored to the opposite side of its origin, then every other. Flipping keeps the
 * alignment, so a panel opened `bottom-start` that has no room below opens `top-start`,
 * still lined up with the start of its trigger, rather than jumping to a centred `top`.
 *
 * @example
 * buildOverlayPositions('bottom-start', { x: 0, y: 4 }).slice(0, 2);
 * // [bottom-start, top-start]  — mirrored, alignment kept
 * buildOverlayPositions('right', { x: 4, y: 0 }).slice(0, 2);
 * // [right, left]
 */
export const buildOverlayPositions = (
  position: overlayPosition,
  offset: Point,
): ConnectedPosition[] => {
  const preferred = OVERLAY_POSITION_MAP[position];
  const flipped = OVERLAY_POSITION_MAP[OVERLAY_FLIPPED_POSITION_MAP[position]];
  const rest = Object.values(OVERLAY_POSITION_MAP).filter(p => p !== preferred && p !== flipped);
  const positions = [preferred, flipped, ...rest];

  return positions.map(position => ({
    ...position,
    offsetX: Math.sign(position.offsetX ?? 0) * offset.x,
    offsetY: Math.sign(position.offsetY ?? 0) * offset.y,
  }));
};
