import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { ThemeService } from '../features';
import { DEFAULT_THEME_CONFIG, ThemeConfig } from '../features/theme/theme.config';
import { THEME_CONFIG } from '../features/theme/theme.token';

export const provideTheme = (config?: Partial<ThemeConfig>): EnvironmentProviders => {
  return makeEnvironmentProviders([
    { provide: THEME_CONFIG, useValue: { ...DEFAULT_THEME_CONFIG, ...config } },
    ThemeService,
  ]);
};