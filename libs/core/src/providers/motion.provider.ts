import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { MotionService } from '../features';
import { DEFAULT_MOTION_CONFIG, MotionConfig } from '../features/motion/motion.config';
import { MOTION_CONFIG } from '../features/motion/motion.token';

export const provideMotion = (config?: Partial<MotionConfig>): EnvironmentProviders => {
  return makeEnvironmentProviders([
    { provide: MOTION_CONFIG, useValue: { ...DEFAULT_MOTION_CONFIG, ...config } },
    MotionService,
    provideEnvironmentInitializer(() => inject(MotionService)),
  ]);
};
