import { InjectionToken } from '@angular/core';
import { DEFAULT_THEME_CONFIG, ThemeConfig } from './theme.config';

export const THEME_CONFIG = new InjectionToken<ThemeConfig>('THEME_CONFIG', {
  factory: () => DEFAULT_THEME_CONFIG,
});
