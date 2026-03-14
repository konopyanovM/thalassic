import { inputSize } from '../input/input.types';

export interface PasswordConfig {
  size: inputSize;
  placeholder: string;
}

export const DEFAULT_PASSWORD_CONFIG: PasswordConfig = {
  size: 'md',
  placeholder: '',
};
