import { systemIcon } from '../icon';
import { alertColor } from './alert.types';

export interface AlertConfig {
  color: alertColor;
  label: Record<alertColor, string> | string;
  hideLabel: boolean;
  /** Leading glyph, either one icon for every color or a per-color status set. */
  icon: Record<alertColor, systemIcon> | systemIcon;
  hideIcon: boolean;
}

export const DEFAULT_ALERT_CONFIG: AlertConfig = {
  color: 'primary',
  label: {
    primary: '',
    secondary: '',
    tertiary: '',
    success: 'TIP: ',
    info: 'INFO: ',
    warning: 'WARNING: ',
    danger: 'IMPORTANT: ',
  },
  hideLabel: false,
  icon: {
    primary: 'info',
    secondary: 'info',
    tertiary: 'info',
    success: 'success',
    info: 'info',
    warning: 'warning',
    danger: 'error',
  },
  hideIcon: false,
};
