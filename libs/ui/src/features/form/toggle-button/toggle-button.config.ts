import { controlSize } from '../../../types';
import { toggleButtonColor, toggleButtonVariant } from './toggle-button.types';

export interface ToggleButtonConfig {
  color: toggleButtonColor;
  variant: toggleButtonVariant;
  size: controlSize;
  fluid: boolean;
  /** Hue of the pressed state; `undefined` keeps the base `color`. */
  checkedColor: toggleButtonColor | undefined;
  /** Treatment of the pressed state; `undefined` uses the filled treatment. */
  checkedVariant: toggleButtonVariant | undefined;
}

export const DEFAULT_TOGGLE_BUTTON_CONFIG: ToggleButtonConfig = {
  color: 'primary',
  variant: 'outlined',
  size: 'md',
  fluid: false,
  checkedColor: undefined,
  checkedVariant: undefined,
};
