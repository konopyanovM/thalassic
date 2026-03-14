import { InjectionToken } from '@angular/core';
import { ButtonConfig, DEFAULT_BUTTON_CONFIG } from './button.config';

export const BUTTON_CONFIG = new InjectionToken<ButtonConfig>('BUTTON_CONFIG', {
  factory: () => DEFAULT_BUTTON_CONFIG,
});
