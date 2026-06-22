import { controlSize, orientation } from '../../../types';
import { chipColor, chipVariant } from '../../chip';
import { chipGroupType } from './chip-group.types';

export interface ChipGroupConfig {
  size: controlSize;
  color: chipColor;
  checkedColor: chipColor | undefined;
  variant: chipVariant;
  checkedVariant: chipVariant | undefined;
  orientation: orientation;
  type: chipGroupType;
  unselectable: boolean;
  rounded: boolean;
}

export const DEFAULT_CHIP_GROUP_CONFIG: ChipGroupConfig = {
  size: 'md',
  color: 'primary',
  checkedColor: undefined,
  variant: 'outlined',
  checkedVariant: undefined,
  orientation: 'horizontal',
  type: 'multiple',
  unselectable: false,
  rounded: false,
};

