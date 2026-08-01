import { color } from '../../types';

export interface HighlightConfig {
  color: color;
  caseSensitive: boolean;
}

export const DEFAULT_HIGHLIGHT_CONFIG: HighlightConfig = {
  color: 'warning',
  caseSensitive: false,
};
