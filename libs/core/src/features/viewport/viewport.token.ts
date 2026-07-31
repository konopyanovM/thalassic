import { InjectionToken } from '@angular/core';
import { DEFAULT_VIEWPORT_CONFIG, ViewportConfig } from './viewport.config';

export const VIEWPORT_CONFIG = new InjectionToken<ViewportConfig>('VIEWPORT_CONFIG', {
  factory: () => DEFAULT_VIEWPORT_CONFIG,
});
