import { selectSize } from './select.types';

export interface SelectConfig {
  size: selectSize;
  placeholder: string;
  fluid: boolean;
}

export const DEFAULT_SELECT_CONFIG: SelectConfig = {
  size: 'md',
  placeholder: '',
  fluid: false,
};