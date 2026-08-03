import { InjectionToken } from '@angular/core';
import { DEFAULT_SLIDER_CONFIG, SliderConfig } from './slider.config';

export const SLIDER_CONFIG = new InjectionToken<SliderConfig>('SLIDER_CONFIG', {
  factory: () => DEFAULT_SLIDER_CONFIG,
});
