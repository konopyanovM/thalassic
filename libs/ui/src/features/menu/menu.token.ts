import { InjectionToken } from '@angular/core';
import { DEFAULT_MENU_CONFIG, MenuConfig } from './menu.config';

export const MENU_CONFIG = new InjectionToken<MenuConfig>('MENU_CONFIG', {
  factory: () => DEFAULT_MENU_CONFIG,
});
