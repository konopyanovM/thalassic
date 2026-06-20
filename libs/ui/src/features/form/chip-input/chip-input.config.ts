import { controlSize } from '../../../types';

export interface ChipInputConfig {
  size: controlSize;
  placeholder: string;
  fluid: boolean;
  separator: string[];
}

export const DEFAULT_CHIP_INPUT_CONFIG: ChipInputConfig = {
  size: 'md',
  placeholder: '',
  fluid: false,
  separator: ['Enter'],
};
