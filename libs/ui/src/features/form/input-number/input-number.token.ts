import { InjectionToken } from '@angular/core';
import { DEFAULT_INPUT_NUMBER_CONFIG, InputNumberConfig } from './input-number.config';

export const INPUT_NUMBER_CONFIG = new InjectionToken<InputNumberConfig>('INPUT_NUMBER_CONFIG', {
  factory: () => DEFAULT_INPUT_NUMBER_CONFIG,
});
