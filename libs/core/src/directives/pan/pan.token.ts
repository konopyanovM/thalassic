import { InjectionToken } from '@angular/core';
import { DEFAULT_PAN_CONFIG, PanConfig } from './pan.config';

export const PAN_CONFIG = new InjectionToken<PanConfig>('PAN_CONFIG', {
  factory: () => DEFAULT_PAN_CONFIG,
});
