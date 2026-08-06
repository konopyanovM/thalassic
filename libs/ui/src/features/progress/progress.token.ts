import { InjectionToken } from '@angular/core';
import { DEFAULT_PROGRESS_CONFIG, ProgressConfig } from './progress.config';

export const PROGRESS_CONFIG = new InjectionToken<ProgressConfig>('PROGRESS_CONFIG', {
  factory: () => DEFAULT_PROGRESS_CONFIG,
});
