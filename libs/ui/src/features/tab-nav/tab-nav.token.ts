import { InjectionToken } from '@angular/core';
import { DEFAULT_TAB_NAV_CONFIG, TabNavConfig } from './tab-nav.config';

export const TAB_NAV_CONFIG = new InjectionToken<TabNavConfig>('TAB_NAV_CONFIG', {
  factory: () => DEFAULT_TAB_NAV_CONFIG,
});
