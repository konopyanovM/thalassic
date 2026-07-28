import { InjectionToken } from '@angular/core';
import { DEFAULT_IMAGE_COMPARE_CONFIG, ImageCompareConfig } from './image-compare.config';

export const IMAGE_COMPARE_CONFIG = new InjectionToken<ImageCompareConfig>('IMAGE_COMPARE_CONFIG', {
  factory: () => DEFAULT_IMAGE_COMPARE_CONFIG,
});
