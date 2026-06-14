import { Point } from '@thalassic/core';
import { menuPosition } from './menu.types';

export interface MenuConfig {
  position: menuPosition;
  offset: Point;
}

export const DEFAULT_MENU_CONFIG: MenuConfig = {
  position: 'bottom-start',
  offset: { x: 0, y: 4 },
};
