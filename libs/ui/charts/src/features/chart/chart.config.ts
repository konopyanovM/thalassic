import { ChartOptions } from 'chart.js';

export interface ChartConfig {
  options: ChartOptions;
}

export const DEFAULT_CHART_CONFIG: ChartConfig = {
  options: {
    maintainAspectRatio: false,
  },
};
