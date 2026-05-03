import { ConnectedPosition } from '@angular/cdk/overlay';
import { Point } from '@thalassic/core';
import { TOOLTIP_POSITION_MAP } from './tooltip.constants';
import { tooltipPosition } from './tooltip.types';

export const buildTooltipPositions = (
  position: tooltipPosition,
  offset: Point,
): ConnectedPosition[] => {
  const preferred = TOOLTIP_POSITION_MAP[position];
  const rest = Object.values(TOOLTIP_POSITION_MAP).filter(p => p !== preferred);
  const positions = [preferred, ...rest];

  return positions.map(position => ({
    ...position,
    offsetX: Math.sign(position.offsetX ?? 0) * offset.x,
    offsetY: Math.sign(position.offsetY ?? 0) * offset.y,
  }));
};
