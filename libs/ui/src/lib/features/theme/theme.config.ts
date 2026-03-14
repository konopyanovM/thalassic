import { themeType } from './types';

export interface ThemeConfig {
  darkThemeClass: string;
  lightThemeClass: string;
  localStorageKey: string;
  defaultTheme: themeType | 'system';
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  darkThemeClass: 'tls-dark',
  lightThemeClass: 'tls-light',
  defaultTheme: 'system',
  localStorageKey: 'tls-theme',
};
