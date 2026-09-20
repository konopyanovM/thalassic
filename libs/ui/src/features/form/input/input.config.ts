import { controlSize } from '../../../types';
import { inputVariant } from './input.types';

export interface InputConfig {
  size: controlSize;
  variant: inputVariant;
  type: string;
  placeholder: string;
  fluid: boolean;
  autosize: boolean;
}

export const DEFAULT_INPUT_CONFIG: InputConfig = {
  size: 'md',
  variant: 'outlined',
  type: 'text',
  placeholder: '',
  fluid: false,
  autosize: false,
};
