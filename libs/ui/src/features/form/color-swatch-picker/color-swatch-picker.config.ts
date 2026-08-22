import { size } from '../../../types';

/** Default accessible names. */
export interface ColorSwatchPickerLabels {
  /** Accessible name of the swatch list, used when the consumer supplies none. */
  list: string;
}

export interface ColorSwatchPickerConfig {
  size: size;
  labels: ColorSwatchPickerLabels;
}

export const DEFAULT_COLOR_SWATCH_PICKER_CONFIG: ColorSwatchPickerConfig = {
  size: 'xs',
  labels: {
    list: 'Colors',
  },
};
