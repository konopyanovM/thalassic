import { Option } from '../../../abstract/form';

export interface ChipGroupOptionContext<V = unknown> {
  option: Option<V>;
  selected: boolean;
  disabled: boolean;
  index: number;
}

export type chipGroupTemplateContext<V = unknown> = { $implicit: ChipGroupOptionContext<V> };

