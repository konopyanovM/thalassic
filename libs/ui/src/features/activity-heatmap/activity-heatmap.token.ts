import { InjectionToken } from '@angular/core';
import { ActivityHeatmapConfig, DEFAULT_ACTIVITY_HEATMAP_CONFIG } from './activity-heatmap.config';

export const ACTIVITY_HEATMAP_CONFIG = new InjectionToken<ActivityHeatmapConfig>(
  'ACTIVITY_HEATMAP_CONFIG',
  { factory: () => DEFAULT_ACTIVITY_HEATMAP_CONFIG },
);
