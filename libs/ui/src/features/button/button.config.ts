import { controlSize } from '../../types';
import { buttonColor, buttonType, buttonVariant } from './button.types';

export interface ButtonConfig {
  color: buttonColor;
  variant: buttonVariant;
  size: controlSize;
  type: buttonType;
  fluid: boolean;
  /**
   * Draws an icon-only button as a circle wherever its own `rounded` input is left unset,
   * the shape platform icon buttons take. A labelled button keeps its corners either way.
   */
  iconRounded: boolean;
}

export const DEFAULT_BUTTON_CONFIG: ButtonConfig = {
  color: 'primary',
  variant: 'filled',
  size: 'md',
  type: 'button',
  fluid: false,
  iconRounded: false,
};
