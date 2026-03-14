import { inputSize } from './input.types';

export interface InputConfig {
  size: inputSize;
  type: string;
  placeholder: string;
}

export const DEFAULT_INPUT_CONFIG: InputConfig = {
  size: 'md',
  type: 'text',
  placeholder: '',
};
