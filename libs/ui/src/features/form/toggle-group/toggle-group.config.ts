import { color, controlSize, orientation } from '../../../types';
import { toggleGroupType } from './toggle-group.types';

export interface ToggleGroupConfig {
  size: controlSize;
  color: color;
  orientation: orientation;
  type: toggleGroupType;
  unselectable: boolean;
}

export const DEFAULT_TOGGLE_GROUP_CONFIG: ToggleGroupConfig = {
  size: 'md',
  color: 'primary',
  orientation: 'horizontal',
  type: 'single',
  unselectable: false,
};
