import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { deepMerge } from '@thalassic/core';
import { CHART_CONFIG, ChartConfig, DEFAULT_CHART_CONFIG } from '../features/chart';

export const provideThalassicChartConfig = (config: ChartConfig): EnvironmentProviders => {
  return makeEnvironmentProviders([
    {
      provide: CHART_CONFIG,
      useValue: deepMerge(DEFAULT_CHART_CONFIG, config),
    },
  ]);
};
