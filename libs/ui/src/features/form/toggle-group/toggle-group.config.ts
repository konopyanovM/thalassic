import { color, controlSize, orientation } from '../../../types';

export interface ToggleGroupConfig {
  size: controlSize;
  color: color;
  orientation: orientation;
  multiple: boolean;
  unselectable: boolean;
}

export const DEFAULT_TOGGLE_GROUP_CONFIG: ToggleGroupConfig = {
  size: 'md',
  color: 'primary',
  orientation: 'horizontal',
  multiple: false,
  unselectable: false,
};
