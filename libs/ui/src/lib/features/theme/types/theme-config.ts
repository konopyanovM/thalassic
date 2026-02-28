import { themeType } from './theme.type';

export interface ThemeConfig {
  darkThemeClass: string;
  lightThemeClass: string;
  localStorageKey: string;
  defaultTheme: themeType | 'system';
}
