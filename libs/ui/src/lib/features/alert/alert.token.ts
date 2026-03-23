import { InjectionToken } from '@angular/core';
import { AlertConfig, DEFAULT_ALERT_CONFIG } from './alert.config';

export const ALERT_CONFIG = new InjectionToken<AlertConfig>('ALERT_CONFIG', {
  factory: () => DEFAULT_ALERT_CONFIG,
});
