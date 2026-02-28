import { THEME_CONFIG_DEFAULT } from '../constants';
import { ThemeService } from '../theme.service';
import { TLS_THEME_CONFIG } from '../tokens';
import { ThemeConfig } from '../types';

export const provideTheme = (config: Partial<ThemeConfig>) => {
  return [
    {
      provide: TLS_THEME_CONFIG,
      useValue: { ...THEME_CONFIG_DEFAULT, ...config },
    },
    ThemeService,
  ];
};
