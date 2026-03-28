import { buttonColor, buttonSize, buttonType, buttonVariant } from './button.types';

export interface ButtonConfig {
  color: buttonColor;
  variant: buttonVariant;
  size: buttonSize;
  type: buttonType;
  fluid: boolean;
}

export const DEFAULT_BUTTON_CONFIG: ButtonConfig = {
  color: 'primary',
  variant: 'filled',
  size: 'md',
  type: 'button',
  fluid: false,
};
