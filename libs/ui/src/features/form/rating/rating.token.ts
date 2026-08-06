import { InjectionToken } from '@angular/core';
import { DEFAULT_RATING_CONFIG, RatingConfig } from './rating.config';

export const RATING_CONFIG = new InjectionToken<RatingConfig>('RATING_CONFIG', {
  factory: () => DEFAULT_RATING_CONFIG,
});
