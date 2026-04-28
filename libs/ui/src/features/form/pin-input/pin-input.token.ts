import { InjectionToken } from '@angular/core';
import { DEFAULT_PIN_INPUT_CONFIG, PinInputConfig } from './pin-input.config';

export const PIN_INPUT_CONFIG = new InjectionToken<PinInputConfig>('PIN_INPUT_CONFIG', {
  factory: () => DEFAULT_PIN_INPUT_CONFIG,
});