import { InjectionToken } from '@angular/core';
import { CarouselConfig, DEFAULT_CAROUSEL_CONFIG } from './carousel.config';

export const CAROUSEL_CONFIG = new InjectionToken<CarouselConfig>('CAROUSEL_CONFIG', {
  factory: () => DEFAULT_CAROUSEL_CONFIG,
});
