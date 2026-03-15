import { themeType } from './types';

export interface ThemeConfig {
  localStorageKey: string;
  defaultTheme: themeType | 'system';
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  defaultTheme: 'system',
  localStorageKey: 'tls-theme',
};
