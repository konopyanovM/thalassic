import { InjectionToken } from '@angular/core';
import { CheckboxConfig, DEFAULT_CHECKBOX_CONFIG } from './checkbox.config';

export const CHECKBOX_CONFIG = new InjectionToken<CheckboxConfig>('CHECKBOX_CONFIG', {
  factory: () => DEFAULT_CHECKBOX_CONFIG,
});
