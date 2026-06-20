import { InjectionToken } from '@angular/core';
import { ChipInputConfig, DEFAULT_CHIP_INPUT_CONFIG } from './chip-input.config';

export const CHIP_INPUT_CONFIG = new InjectionToken<ChipInputConfig>('CHIP_INPUT_CONFIG', {
  factory: () => DEFAULT_CHIP_INPUT_CONFIG,
});
