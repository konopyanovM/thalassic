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
}

export const DEFAULT_MULTI_SELECT_CONFIG: MultiSelectConfig = {
  size: 'md',
  placeholder: '',
  fluid: false,
  clearable: false,
  maxLabels: 2,
  clearLabel: 'Clear',
  selectedCountLabel: count => `${count} selected`,
};
