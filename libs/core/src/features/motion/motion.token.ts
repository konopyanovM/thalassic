import { InjectionToken } from '@angular/core';
import { DEFAULT_MOTION_CONFIG, MotionConfig } from './motion.config';

export const MOTION_CONFIG = new InjectionToken<MotionConfig>('MOTION_CONFIG', {
  factory: () => DEFAULT_MOTION_CONFIG,
});
