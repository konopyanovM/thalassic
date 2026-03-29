import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { CHART_CONFIG, ChartConfig, DEFAULT_CHART_CONFIG } from '../features';
import { mergeConfig } from '../utils';

export const provideThalassicChartConfig = (config: ChartConfig): EnvironmentProviders => {
  return makeEnvironmentProviders([
    {
      provide: CHART_CONFIG,
      useValue: mergeConfig(DEFAULT_CHART_CONFIG, config),
    },
  ]);
};
