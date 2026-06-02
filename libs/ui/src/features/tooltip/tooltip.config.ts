import { ConnectedPosition } from '@angular/cdk/overlay';
import { Point } from '@thalassic/core';
import { tooltipColor, tooltipOrigin, tooltipPosition } from './tooltip.types';

export interface TooltipConfig {
  positions: ConnectedPosition[] | undefined;
  position: tooltipPosition;
  offset: Point;
  origin: tooltipOrigin;
  color: tooltipColor;
}

export const DEFAULT_TOOLTIP_CONFIG: TooltipConfig = {
  positions: undefined,
  position: 'top',
  offset: { x: 4, y: 4 },
  origin: 'element',
  color: 'secondary',
};
