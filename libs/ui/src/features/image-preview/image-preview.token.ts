import { InjectionToken } from '@angular/core';
import { DEFAULT_IMAGE_PREVIEW_CONFIG, ImagePreviewConfig } from './image-preview.config';

export const IMAGE_PREVIEW_CONFIG = new InjectionToken<ImagePreviewConfig>('IMAGE_PREVIEW_CONFIG', {
  factory: () => DEFAULT_IMAGE_PREVIEW_CONFIG,
});
