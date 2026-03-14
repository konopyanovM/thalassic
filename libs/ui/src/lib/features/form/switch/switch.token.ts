import { InjectionToken } from '@angular/core';
import { DEFAULT_SWITCH_CONFIG, SwitchConfig } from './switch.config';

export const SWITCH_CONFIG = new InjectionToken<SwitchConfig>('SWITCH_CONFIG', {
  factory: () => DEFAULT_SWITCH_CONFIG,
});
