import { chipColor } from './chip.types';

export interface ChipControlConfig {
  checkedColor: chipColor | undefined;
}

export const DEFAULT_CHIP_CONTROL_CONFIG: ChipControlConfig = {
  checkedColor: undefined,
};