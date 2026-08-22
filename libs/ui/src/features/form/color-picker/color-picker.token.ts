import { InjectionToken } from '@angular/core';
import { ColorPickerConfig, DEFAULT_COLOR_PICKER_CONFIG } from './color-picker.config';

export const COLOR_PICKER_CONFIG = new InjectionToken<ColorPickerConfig>('COLOR_PICKER_CONFIG', {
  factory: () => DEFAULT_COLOR_PICKER_CONFIG,
});
