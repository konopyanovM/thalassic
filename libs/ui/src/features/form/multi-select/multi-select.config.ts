import { controlSize } from '../../../types';

export interface MultiSelectConfig {
  size: controlSize;
  placeholder: string;
  fluid: boolean;
  clearable: boolean;
  maxLabels: number;
  /** Accessible name for the clear button, overridable for localization. */
  clearLabel: string;
  /** Trigger label when more than `maxLabels` options are selected, overridable for localization. */
  selectedCountLabel: (count: number) => string;
  /** Renders the panel through a virtual-scroll viewport, windowing the option list. */
  virtualScroll: boolean;
  /** Fixed height of an option row, in pixels, when the panel is virtualized. */
  virtualScrollItemSize: number;
}

export const DEFAULT_MULTI_SELECT_CONFIG: MultiSelectConfig = {
  size: 'md',
  placeholder: '',
  fluid: false,
  clearable: false,
  maxLabels: 2,
  clearLabel: 'Clear',
  selectedCountLabel: count => `${count} selected`,
  virtualScroll: false,
  // The default option row: body-medium line-height (23px) plus block padding (2 × 8px).
  virtualScrollItemSize: 39,
};
