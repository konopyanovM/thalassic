import { controlSize } from '../../types';
import { chipColor, chipVariant } from './chip.types';

export interface ChipConfig {
  color: chipColor;
  variant: chipVariant;
  size: controlSize;
}

export const DEFAULT_CHIP_CONFIG: ChipConfig = {
  color: 'primary',
  variant: 'filled',
  size: 'md',
};