import { controlSize } from '../../types';
import { buttonColor, buttonType, buttonVariant } from './button.types';

export interface ButtonConfig {
  color: buttonColor;
  variant: buttonVariant;
  size: controlSize;
  type: buttonType;
  fluid: boolean;
  /**
   * Rounds the ends of every button whose own `rounded` input is left unset: a pill for a
   * labelled button, a circle for an icon-only one. One product-wide shape decision, so a
   * single button departs from it with an explicit `[rounded]="false"`.
   */
  rounded: boolean;
  /**
   * Draws an icon-only button as a circle wherever its own `rounded` input is left unset,
   * the shape platform icon buttons take. A labelled button follows `rounded` alone, so this
   * adds nothing once `rounded` is on.
   */
  iconRounded: boolean;
}

export const DEFAULT_BUTTON_CONFIG: ButtonConfig = {
  color: 'primary',
  variant: 'filled',
  size: 'md',
  type: 'button',
  fluid: false,
  rounded: false,
  iconRounded: false,
};
