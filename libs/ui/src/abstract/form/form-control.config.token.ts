import { InjectionToken } from '@angular/core';
import { DEFAULT_FORM_CONTROL_CONFIG, FormControlConfig } from './form-control.config';

export const FORM_CONTROL_CONFIG = new InjectionToken<FormControlConfig>('FORM_CONTROL_CONFIG', {
  factory: () => DEFAULT_FORM_CONTROL_CONFIG,
});
