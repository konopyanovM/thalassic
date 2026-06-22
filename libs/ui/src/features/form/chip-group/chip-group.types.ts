import { Option, selectionMode } from '../../../abstract/form';

export type chipGroupType = selectionMode;

export interface ChipGroupOptionContext<V = unknown> {
  option: Option<V>;
  selected: boolean;
  disabled: boolean;
  index: number;
}

export type chipGroupTemplateContext<V = unknown> = { $implicit: ChipGroupOptionContext<V> };

