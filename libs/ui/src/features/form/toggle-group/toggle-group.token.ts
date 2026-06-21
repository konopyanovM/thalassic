import { InjectionToken } from '@angular/core';
import { DEFAULT_TOGGLE_GROUP_CONFIG, ToggleGroupConfig } from './toggle-group.config';

export const TOGGLE_GROUP_CONFIG = new InjectionToken<ToggleGroupConfig>('TOGGLE_GROUP_CONFIG', {
  factory: () => DEFAULT_TOGGLE_GROUP_CONFIG,
});
