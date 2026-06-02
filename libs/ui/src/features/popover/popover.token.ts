import { InjectionToken } from '@angular/core';
import { DEFAULT_POPOVER_CONFIG, PopoverConfig } from './popover.config';

export const POPOVER_CONFIG = new InjectionToken<PopoverConfig>('POPOVER_CONFIG', {
  factory: () => DEFAULT_POPOVER_CONFIG,
});