import { InjectionToken } from '@angular/core';
import { DEFAULT_SELECT_CONFIG, SelectConfig } from './select.config';

export const SELECT_CONFIG = new InjectionToken<SelectConfig>('SELECT_CONFIG', {
  factory: () => DEFAULT_SELECT_CONFIG,
});