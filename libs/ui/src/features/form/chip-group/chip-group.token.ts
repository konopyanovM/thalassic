import { InjectionToken } from '@angular/core';
import { ChipGroupConfig, DEFAULT_CHIP_GROUP_CONFIG } from './chip-group.config';

export const CHIP_GROUP_CONFIG = new InjectionToken<ChipGroupConfig>('CHIP_GROUP_CONFIG', {
  factory: () => DEFAULT_CHIP_GROUP_CONFIG,
});

