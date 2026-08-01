import { color } from '../../types';

export interface MarkConfig {
  color: color;
}

export const DEFAULT_MARK_CONFIG: MarkConfig = {
  color: 'warning',
};
