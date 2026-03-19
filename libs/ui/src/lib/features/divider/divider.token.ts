import { InjectionToken } from '@angular/core';
import { DEFAULT_DIVIDER_CONFIG, DividerConfig } from './divider.config';

export const DIVIDER_CONFIG = new InjectionToken<DividerConfig>('DIVIDER_CONFIG', {
  factory: () => DEFAULT_DIVIDER_CONFIG,
});
