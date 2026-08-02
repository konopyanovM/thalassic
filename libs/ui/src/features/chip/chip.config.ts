import { chipColor, chipSize, chipVariant } from './chip.types';

export interface ChipConfig {
  color: chipColor;
  variant: chipVariant;
  size: chipSize;
}

export const DEFAULT_CHIP_CONFIG: ChipConfig = {
  color: 'primary',
  variant: 'filled',
  size: 'md',
};