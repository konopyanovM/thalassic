import { InjectionToken } from '@angular/core';
import { DEFAULT_DIRECTION_CONFIG, DirectionConfig } from './direction.config';

export const DIRECTION_CONFIG = new InjectionToken<DirectionConfig>('DIRECTION_CONFIG', {
  factory: () => DEFAULT_DIRECTION_CONFIG,
});
