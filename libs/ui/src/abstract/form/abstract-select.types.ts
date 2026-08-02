/**
 * Context exposed to a consumer-provided option template of a listbox control
 * (`tls-select`, `tls-multi-select`, `tls-autocomplete`).
 */
export interface SelectOptionContext<T = unknown, V = unknown> {
  /** The consumer's original option object (or primitive). */
  option: T;
  value: V;
  label: string;
  index: number;
  selected: boolean;
  /** Whether the option is the one keyboard navigation currently rests on. */
  active: boolean;
  disabled: boolean;
}

export type selectTemplateContext<T = unknown, V = unknown> = {
  $implicit: SelectOptionContext<T, V>;
};
