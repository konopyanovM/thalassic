import { InjectionToken } from '@angular/core';
import { DEFAULT_INPUT_CONFIG, InputConfig } from './input.config';

export const INPUT_CONFIG = new InjectionToken<InputConfig>('INPUT_CONFIG', {
  factory: () => DEFAULT_INPUT_CONFIG,
});
