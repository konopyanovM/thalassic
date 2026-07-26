import { color, controlSize, orientation } from '../../../types';
import { toggleGroupVariant } from './toggle-group.types';

export interface ToggleGroupConfig {
  size: controlSize;
  color: color;
  variant: toggleGroupVariant;
  orientation: orientation;
  multiple: boolean;
  unselectable: boolean;
  fluid: boolean;
}

export const DEFAULT_TOGGLE_GROUP_CONFIG: ToggleGroupConfig = {
  size: 'md',
  color: 'primary',
  variant: 'filled',
  orientation: 'horizontal',
  multiple: false,
  unselectable: false,
  fluid: false,
};
