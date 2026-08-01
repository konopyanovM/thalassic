import { controlSize } from '../../types';

export interface KbdConfig {
  size: controlSize;
}

export const DEFAULT_KBD_CONFIG: KbdConfig = {
  size: 'md',
};
