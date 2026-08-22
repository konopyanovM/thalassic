import { InjectionToken } from '@angular/core';
import {
  ColorSwatchPickerConfig,
  DEFAULT_COLOR_SWATCH_PICKER_CONFIG,
} from './color-swatch-picker.config';

export const COLOR_SWATCH_PICKER_CONFIG = new InjectionToken<ColorSwatchPickerConfig>(
  'COLOR_SWATCH_PICKER_CONFIG',
  { factory: () => DEFAULT_COLOR_SWATCH_PICKER_CONFIG },
);
