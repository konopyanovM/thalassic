import { ChartTypeRegistry } from 'chart.js';

export const CARTESIAN_CHARTS: (keyof ChartTypeRegistry)[] = [
  'bar',
  'line',
  'scatter',
  'bubble',
] as const;
export const RADIAL_CHARTS: (keyof ChartTypeRegistry)[] = ['polarArea', 'radar'];
