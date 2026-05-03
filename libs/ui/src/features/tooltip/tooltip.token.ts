import { InjectionToken } from '@angular/core';
import { DEFAULT_TOOLTIP_CONFIG, TooltipConfig } from './tooltip.config';

export const TOOLTIP_CONFIG = new InjectionToken<TooltipConfig>('TOOLTIP_CONFIG', {
  factory: () => DEFAULT_TOOLTIP_CONFIG,
});
