import { InjectionToken } from '@angular/core';
import { DEFAULT_MARK_CONFIG, MarkConfig } from './mark.config';

export const MARK_CONFIG = new InjectionToken<MarkConfig>('MARK_CONFIG', {
  factory: () => DEFAULT_MARK_CONFIG,
});
