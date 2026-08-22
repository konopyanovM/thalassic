import { InjectionToken } from '@angular/core';
import { ColorInputConfig, DEFAULT_COLOR_INPUT_CONFIG } from './color-input.config';

export const COLOR_INPUT_CONFIG = new InjectionToken<ColorInputConfig>('COLOR_INPUT_CONFIG', {
  factory: () => DEFAULT_COLOR_INPUT_CONFIG,
});
