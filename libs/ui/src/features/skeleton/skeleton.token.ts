import { InjectionToken } from '@angular/core';
import { DEFAULT_SKELETON_CONFIG, SkeletonConfig } from './skeleton.config';

export const SKELETON_CONFIG = new InjectionToken<SkeletonConfig>('SKELETON_CONFIG', {
  factory: () => DEFAULT_SKELETON_CONFIG,
});
