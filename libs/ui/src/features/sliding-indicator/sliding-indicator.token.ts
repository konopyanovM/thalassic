import { InjectionToken } from '@angular/core';
import {
  DEFAULT_SLIDING_INDICATOR_CONFIG,
  SlidingIndicatorConfig,
} from './sliding-indicator.config';

export const SLIDING_INDICATOR_CONFIG = new InjectionToken<SlidingIndicatorConfig>(
  'SLIDING_INDICATOR_CONFIG',
  { factory: () => DEFAULT_SLIDING_INDICATOR_CONFIG },
);
