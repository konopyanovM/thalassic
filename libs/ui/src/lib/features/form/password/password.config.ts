import { inputSize } from '../input/input.types';

export interface PasswordConfig {
  size: inputSize;
  placeholder: string;
  fluid: boolean;
}

export const DEFAULT_PASSWORD_CONFIG: PasswordConfig = {
  size: 'md',
  placeholder: '',
  fluid: false,
};
