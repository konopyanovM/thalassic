import { InjectionToken } from '@angular/core';
import { DEFAULT_DRAWER_CONFIG, DrawerConfig } from './drawer.config';

export const DRAWER_CONFIG = new InjectionToken<DrawerConfig>('DRAWER_CONFIG', {
  factory: () => DEFAULT_DRAWER_CONFIG,
});
