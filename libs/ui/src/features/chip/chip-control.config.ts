import { chipColor, chipVariant } from './chip.types';

export interface ChipControlConfig {
  checkedColor: chipColor | undefined;
  checkedVariant: chipVariant | undefined;
}

export const DEFAULT_CHIP_CONTROL_CONFIG: ChipControlConfig = {
  checkedColor: undefined,
  checkedVariant: undefined,
};
