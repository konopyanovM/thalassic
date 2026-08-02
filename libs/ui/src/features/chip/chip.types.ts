import { color } from '../../types';

export type chipColor = color;
export type chipVariant = 'filled' | 'tonal' | 'outlined' | 'text';
export type chipSize = 'xs' | 'sm' | 'md' | 'lg';

export interface ChipContext {
  checked: boolean;
  disabled: boolean;
  readonly: boolean;
  touched: boolean;
  dirty: boolean;
  invalid: boolean;
  pending: boolean;
}

export type chipTemplateContext = { $implicit: ChipContext };
