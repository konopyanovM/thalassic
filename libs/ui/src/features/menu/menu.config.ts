import { breakpoint, Point } from '@thalassic/core';
import { menuPosition } from './menu.types';

export interface MenuConfig {
  position: menuPosition;
  offset: Point;
  /**
   * Breakpoint at or below which the menu opens as a bottom sheet instead of
   * an anchored panel: a small viewport rarely fits a floating panel beside
   * its trigger, and a thumb-reachable sheet is the platform-native list of
   * choices there. `null` keeps every menu anchored. Takes effect only when
   * the app provides the viewport (`provideViewport()`).
   */
  sheetBelow: breakpoint | null;
}

export const DEFAULT_MENU_CONFIG: MenuConfig = {
  position: 'bottom-start',
  offset: { x: 0, y: 4 },
  sheetBelow: null,
};
