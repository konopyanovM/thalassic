import { InjectionToken } from '@angular/core';
import { DEFAULT_MULTI_SELECT_CONFIG, MultiSelectConfig } from './multi-select.config';

export const MULTI_SELECT_CONFIG = new InjectionToken<MultiSelectConfig>('MULTI_SELECT_CONFIG', {
  factory: () => DEFAULT_MULTI_SELECT_CONFIG,
});
