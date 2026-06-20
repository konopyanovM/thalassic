import { InjectionToken } from '@angular/core';
import { ChipControlConfig, DEFAULT_CHIP_CONTROL_CONFIG } from './chip-control.config';

export const CHIP_CONTROL_CONFIG = new InjectionToken<ChipControlConfig>('CHIP_CONTROL_CONFIG', {
  factory: () => DEFAULT_CHIP_CONTROL_CONFIG,
});