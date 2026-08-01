import { InjectionToken } from '@angular/core';
import { DEFAULT_TOGGLE_BUTTON_CONFIG, ToggleButtonConfig } from './toggle-button.config';

export const TOGGLE_BUTTON_CONFIG = new InjectionToken<ToggleButtonConfig>('TOGGLE_BUTTON_CONFIG', {
  factory: () => DEFAULT_TOGGLE_BUTTON_CONFIG,
});
