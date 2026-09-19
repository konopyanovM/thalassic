import { controlSize } from '../../../types';
import { inputVariant } from '../input/input.types';

export interface InputNumberConfig {
  size: controlSize;
  variant: inputVariant;
  placeholder: string;
  fluid: boolean;
  step: number;
  hideArrows: boolean;
}

export const DEFAULT_INPUT_NUMBER_CONFIG: InputNumberConfig = {
  size: 'md',
  variant: 'outlined',
  placeholder: '',
  fluid: false,
  step: 1,
  hideArrows: true,
};
