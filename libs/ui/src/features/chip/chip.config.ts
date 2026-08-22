import { chipColor, chipSize, chipVariant } from './chip.types';

export interface ChipConfig {
  color: chipColor;
  variant: chipVariant;
  size: chipSize;
}

// Tonal at rest: a bare chip is a soft wash of its hue rather than a solid
// pill, so it annotates without shouting — filled is the opt-in emphasis.
export const DEFAULT_CHIP_CONFIG: ChipConfig = {
  color: 'primary',
  variant: 'tonal',
  size: 'md',
};