import { controlSize } from '../../../types';

export interface PasswordConfig {
  size: controlSize;
  placeholder: string;
  fluid: boolean;
}

export const DEFAULT_PASSWORD_CONFIG: PasswordConfig = {
  size: 'md',
  placeholder: '',
  fluid: false,
};
