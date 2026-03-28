import { alertColor } from './alert.types';

export interface AlertConfig {
  color: alertColor;
  label: Record<alertColor, string> | string;
  hideLabel: boolean;
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
};
