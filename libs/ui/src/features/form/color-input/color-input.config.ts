import { controlSize } from '../../../types';

/** Accessible names for the control's inner elements. */
export interface ColorInputLabels {
  openPicker: string;
  /** Name of the popover dialog holding the picker panel. */
  panel: string;
}

export interface ColorInputConfig {
  size: controlSize;
  fluid: boolean;
  placeholder: string;
  labels: ColorInputLabels;
}

export const DEFAULT_COLOR_INPUT_CONFIG: ColorInputConfig = {
  size: 'md',
  fluid: false,
  placeholder: '',
  labels: {
    openPicker: 'Open color picker',
    panel: 'Color picker',
  },
};
