import { colorRangeSize } from './color-range.types';

/** Default accessible names, per channel. */
export interface ColorRangeLabels {
  hue: string;
  alpha: string;
}

export interface ColorRangeConfig {
  size: colorRangeSize;
  labels: ColorRangeLabels;
}

export const DEFAULT_COLOR_RANGE_CONFIG: ColorRangeConfig = {
  size: 'md',
  labels: {
    hue: 'Hue',
    alpha: 'Opacity',
  },
};
