import { orientation } from '../../../types';
import { chipColor, chipSize, chipVariant } from '../../chip';

export interface ChipGroupConfig {
  size: chipSize;
  color: chipColor;
  checkedColor: chipColor | undefined;
  variant: chipVariant;
  checkedVariant: chipVariant | undefined;
  orientation: orientation;
  multiple: boolean;
  unselectable: boolean;
  rounded: boolean;
  fluid: boolean;
}

export const DEFAULT_CHIP_GROUP_CONFIG: ChipGroupConfig = {
  size: 'md',
  color: 'primary',
  checkedColor: undefined,
  variant: 'outlined',
  checkedVariant: undefined,
  orientation: 'horizontal',
  multiple: false,
  unselectable: false,
  rounded: false,
  fluid: false,
};
