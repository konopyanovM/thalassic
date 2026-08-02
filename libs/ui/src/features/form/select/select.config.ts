import { controlSize } from '../../../types';

export interface SelectConfig {
  size: controlSize;
  placeholder: string;
  fluid: boolean;
  clearable: boolean;
  /** Accessible name for the clear button, overridable for localization. */
  clearLabel: string;
}

export const DEFAULT_SELECT_CONFIG: SelectConfig = {
  size: 'md',
  placeholder: '',
  fluid: false,
  clearable: false,
  clearLabel: 'Clear',
};