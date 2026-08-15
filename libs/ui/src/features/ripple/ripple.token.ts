import { InjectionToken } from '@angular/core';
import { DEFAULT_RIPPLE_CONFIG, RippleConfig } from './ripple.config';

export const RIPPLE_CONFIG = new InjectionToken<RippleConfig>('RIPPLE_CONFIG', {
  factory: () => DEFAULT_RIPPLE_CONFIG,
});
