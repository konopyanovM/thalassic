import { switchColor } from './switch.types';

export interface SwitchConfig {
  color: switchColor;
}

export const DEFAULT_SWITCH_CONFIG: SwitchConfig = {
  color: 'primary',
};
