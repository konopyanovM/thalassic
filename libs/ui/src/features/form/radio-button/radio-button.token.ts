import { InjectionToken } from '@angular/core';
import { DEFAULT_RADIO_BUTTON_CONFIG, RadioButtonConfig } from './radio-button.config';

export const RADIO_BUTTON_CONFIG = new InjectionToken<RadioButtonConfig>('RADIO_BUTTON_CONFIG', {
  factory: () => DEFAULT_RADIO_BUTTON_CONFIG,
});
