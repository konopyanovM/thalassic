import { InjectionToken } from '@angular/core';
import { DEFAULT_ODOMETER_CONFIG, OdometerConfig } from './odometer.config';

export const ODOMETER_CONFIG = new InjectionToken<OdometerConfig>('ODOMETER_CONFIG', {
  factory: () => DEFAULT_ODOMETER_CONFIG,
});
