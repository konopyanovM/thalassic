import { themePreference } from './types';

export interface ThemeConfig {
  localStorageKey: string;
  defaultTheme: themePreference;
}

export const DEFAULT_THEME_CONFIG: ThemeConfig = {
  defaultTheme: 'system',
  localStorageKey: 'tls-theme-preference',
};
