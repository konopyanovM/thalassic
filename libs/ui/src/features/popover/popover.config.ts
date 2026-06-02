import { Point } from '@thalassic/core';
import { overlayPosition } from '../../types';

export interface PopoverConfig {
  position: overlayPosition;
  offset: Point;
}

export const DEFAULT_POPOVER_CONFIG: PopoverConfig = {
  position: 'bottom',
  offset: { x: 0, y: 4 },
};
