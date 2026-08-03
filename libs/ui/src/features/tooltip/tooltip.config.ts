import { ConnectedPosition } from '@angular/cdk/overlay';
import { Point } from '@thalassic/core';
import { tooltipColor, tooltipOrigin, tooltipPosition } from './tooltip.types';

export interface TooltipConfig {
  positions: ConnectedPosition[] | undefined;
  position: tooltipPosition;
  offset: Point;
  origin: tooltipOrigin;
  color: tooltipColor;
  arrow: boolean;
}

export const DEFAULT_TOOLTIP_CONFIG: TooltipConfig = {
  positions: undefined,
  position: 'top',
  // Clears the arrow, which protrudes `--tls-tooltip-arrow-height` past the bubble.
  offset: { x: 8, y: 8 },
  origin: 'element',
  color: 'secondary',
  arrow: true,
};
