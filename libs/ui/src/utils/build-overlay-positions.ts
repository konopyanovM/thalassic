import { ConnectedPosition } from '@angular/cdk/overlay';
import { Point } from '@thalassic/core';
import { OVERLAY_POSITION_MAP } from '../constants';
import { overlayPosition } from '../types';

export const buildOverlayPositions = (
  position: overlayPosition,
  offset: Point,
): ConnectedPosition[] => {
  const preferred = OVERLAY_POSITION_MAP[position];
  const rest = Object.values(OVERLAY_POSITION_MAP).filter(p => p !== preferred);
  const positions = [preferred, ...rest];

  return positions.map(position => ({
    ...position,
    offsetX: Math.sign(position.offsetX ?? 0) * offset.x,
    offsetY: Math.sign(position.offsetY ?? 0) * offset.y,
  }));
};
