import { InjectionToken } from '@angular/core';
import { DEFAULT_DRAWER_CONFIG, DrawerConfig, DrawerPanelConfig } from './drawer.config';
import { DrawerOpening } from './drawer.types';

export const DRAWER_CONFIG = new InjectionToken<DrawerConfig>('DRAWER_CONFIG', {
  factory: () => DEFAULT_DRAWER_CONFIG,
});

/** One panel's resolved configuration. Provided per drawer by `DrawerService`. */
export const DRAWER_PANEL_CONFIG = new InjectionToken<DrawerPanelConfig>('DRAWER_PANEL_CONFIG');

/** How a drawer is being opened. Provided per drawer by `DrawerService`. */
export const DRAWER_OPENING = new InjectionToken<DrawerOpening>('DRAWER_OPENING', {
  factory: () => ({ origin: null, byDrag: false }),
});
