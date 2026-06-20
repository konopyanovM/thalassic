import { InjectionToken } from '@angular/core';
import { ChipConfig, DEFAULT_CHIP_CONFIG } from './chip.config';

export const CHIP_CONFIG = new InjectionToken<ChipConfig>('CHIP_CONFIG', {
  factory: () => DEFAULT_CHIP_CONFIG,
});