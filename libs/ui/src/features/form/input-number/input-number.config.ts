import { controlSize } from '../../../types';

export interface InputNumberConfig {
  size: controlSize;
  placeholder: string;
  fluid: boolean;
  step: number;
  hideArrows: boolean;
}

export const DEFAULT_INPUT_NUMBER_CONFIG: InputNumberConfig = {
  size: 'md',
  placeholder: '',
  fluid: false,
  step: 1,
  hideArrows: true,
};
