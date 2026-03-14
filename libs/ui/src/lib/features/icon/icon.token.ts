import { InjectionToken } from '@angular/core';
import { DEFAULT_ICON_CONFIG, IconConfig } from './icon.config';

export const ICON_CONFIG = new InjectionToken<IconConfig>('ICON_CONFIG', {
  factory: () => DEFAULT_ICON_CONFIG,
});
