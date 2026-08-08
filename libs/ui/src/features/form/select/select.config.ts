import { controlSize } from '../../../types';

export interface SelectConfig {
  size: controlSize;
  placeholder: string;
  fluid: boolean;
  clearable: boolean;
  /** Accessible name for the clear button, overridable for localization. */
  clearLabel: string;
  /** Renders the panel through a virtual-scroll viewport, windowing the option list. */
  virtualScroll: boolean;
  /** Fixed height of an option row, in pixels, when the panel is virtualized. */
  virtualScrollItemSize: number;
}

export const DEFAULT_SELECT_CONFIG: SelectConfig = {
  size: 'md',
  placeholder: '',
  fluid: false,
  clearable: false,
  clearLabel: 'Clear',
  virtualScroll: false,
  // The default option row: body-medium line-height (23px) plus block padding (2 × 8px).
  virtualScrollItemSize: 39,
};