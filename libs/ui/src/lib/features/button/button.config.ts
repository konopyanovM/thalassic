import { buttonAppearance, buttonColor, buttonSize, buttonType } from './button.types';

export interface ButtonConfig {
  color: buttonColor;
  appearance: buttonAppearance;
  size: buttonSize;
  type: buttonType;
}

export const DEFAULT_BUTTON_CONFIG: ButtonConfig = {
  color: 'primary',
  appearance: 'filled',
  size: 'md',
  type: 'button',
};
