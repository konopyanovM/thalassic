import { controlSize } from '../../../types';

export interface MultiSelectConfig {
  size: controlSize;
  placeholder: string;
  fluid: boolean;
  clearable: boolean;
  maxLabels: number;
}

export const DEFAULT_MULTI_SELECT_CONFIG: MultiSelectConfig = {
  size: 'md',
  placeholder: '',
  fluid: false,
  clearable: false,
  maxLabels: 2,
};
