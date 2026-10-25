export interface Option<V = unknown> {
  value: V;
  label: string;
  disabled: boolean;
  /** Label of the group the option is listed under, or `null` when it belongs to none. */
  group: string | null;
  source: unknown;
}
