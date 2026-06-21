import { color } from '../../types';

export type chipColor = color;
export type chipVariant = 'filled' | 'outlined' | 'text';

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