import { InjectionToken } from '@angular/core';
import { DEFAULT_TABS_CONFIG, TabsConfig } from './tabs.config';

export const TABS_CONFIG = new InjectionToken<TabsConfig>('TABS_CONFIG', {
  factory: () => DEFAULT_TABS_CONFIG,
});
