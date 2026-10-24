import { Point } from '@thalassic/core';
import { overlayPosition } from '../../types';

export interface PopoverConfig {
  position: overlayPosition;
  offset: Point;
  /**
   * Minimum gap in px kept between the panel and the viewport's edges when the
   * panel has to be pushed or shrunk to stay on screen.
   */
  viewportMargin: number;
}

export const DEFAULT_POPOVER_CONFIG: PopoverConfig = {
  position: 'bottom',
  offset: { x: 0, y: 4 },
  viewportMargin: 8,
};
