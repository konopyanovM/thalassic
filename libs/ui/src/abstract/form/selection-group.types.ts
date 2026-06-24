export interface SelectionGroupOptionContext<T = unknown, V = unknown> {
  option: T;
  value: V;
  label: string;
  selected: boolean;
  disabled: boolean;
  index: number;
}

export type selectionGroupTemplateContext<T = unknown, V = unknown> = {
  $implicit: SelectionGroupOptionContext<T, V>;
};

