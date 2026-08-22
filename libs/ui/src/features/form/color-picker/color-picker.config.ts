import { controlSize } from '../../../types';
import { FORMAT_CYCLE } from './color-picker.constants';
import { colorFormat, hexCase } from './color-picker.types';

/** Accessible names for the picker's inner controls. */
export interface ColorPickerLabels {
  saturationBrightness: string;
  colorValue: string;
  switchFormat: string;
  eyedropper: string;
  presets: string;
}

export interface ColorPickerConfig {
  size: controlSize;
  /**
   * Notations the readout may display, in cycle order; the first entry is the
   * starting format. A single entry pins the readout and hides the toggle.
   */
  formats: colorFormat[];
  /** Letter case hex notation is displayed in; committed values stay lowercase. */
  hexCase: hexCase;
  labels: ColorPickerLabels;
}

export const DEFAULT_COLOR_PICKER_CONFIG: ColorPickerConfig = {
  size: 'md',
  formats: FORMAT_CYCLE,
  hexCase: 'lower',
  labels: {
    saturationBrightness: 'Saturation and brightness',
    colorValue: 'Color value',
    switchFormat: 'Switch color format',
    eyedropper: 'Pick color from screen',
    presets: 'Preset colors',
  },
};
