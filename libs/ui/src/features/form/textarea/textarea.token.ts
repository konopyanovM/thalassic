import { InjectionToken } from '@angular/core';
import { DEFAULT_TEXTAREA_CONFIG, TextareaConfig } from './textarea.config';

export const TEXTAREA_CONFIG = new InjectionToken<TextareaConfig>('TEXTAREA_CONFIG', {
  factory: () => DEFAULT_TEXTAREA_CONFIG,
});
