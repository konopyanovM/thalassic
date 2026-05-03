import { ConnectedPosition } from '@angular/cdk/overlay';
import { Point } from '@thalassic/core';
import { DEFAULT_TOOLTIP_OFFSET } from './tooltip.constants';
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
  offset: DEFAULT_TOOLTIP_OFFSET,
  origin: 'element',
  color: 'secondary',
};
