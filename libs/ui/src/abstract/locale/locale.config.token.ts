import { InjectionToken } from '@angular/core';
import { DEFAULT_LOCALE_CONFIG, LocaleConfig } from './locale.config';

export const LOCALE_CONFIG = new InjectionToken<LocaleConfig>('LOCALE_CONFIG', {
  factory: () => DEFAULT_LOCALE_CONFIG,
});
