import { InjectionToken } from '@angular/core';
import { ColorRangeConfig, DEFAULT_COLOR_RANGE_CONFIG } from './color-range.config';

export const COLOR_RANGE_CONFIG = new InjectionToken<ColorRangeConfig>('COLOR_RANGE_CONFIG', {
  factory: () => DEFAULT_COLOR_RANGE_CONFIG,
});
