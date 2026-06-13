import { InjectionToken } from '@angular/core';
import { ChartConfig, DEFAULT_CHART_CONFIG } from './chart.config';

export const CHART_CONFIG = new InjectionToken<ChartConfig>('CHART_CONFIG', {
  factory: () => DEFAULT_CHART_CONFIG,
});
