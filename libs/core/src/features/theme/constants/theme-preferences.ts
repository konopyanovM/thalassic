import { themePreference } from '../types';

/** Every valid {@link themePreference}, used to validate untrusted values (e.g. localStorage). */
export const THEME_PREFERENCES: readonly themePreference[] = ['light', 'dark', 'system'];
