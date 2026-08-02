import { controlSize } from '../../../types';

export interface PasswordConfig {
  size: controlSize;
  placeholder: string;
  fluid: boolean;
  /** Accessible name for the toggle when the password is hidden ("reveal" action). */
  showAriaLabel: string;
  /** Accessible name for the toggle when the password is visible ("conceal" action). */
  hideAriaLabel: string;
  /** Visible fallback text for the reveal action when no `showIcon` slot is provided. */
  showLabel: string;
  /** Visible fallback text for the conceal action when no `hideIcon` slot is provided. */
  hideLabel: string;
}

export const DEFAULT_PASSWORD_CONFIG: PasswordConfig = {
  size: 'md',
  placeholder: '',
  fluid: false,
  showAriaLabel: 'Show password',
  hideAriaLabel: 'Hide password',
  showLabel: 'Show',
  hideLabel: 'Hide',
};
