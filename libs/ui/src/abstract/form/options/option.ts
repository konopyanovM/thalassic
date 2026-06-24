export interface Option<V = unknown> {
  value: V;
  label: string;
  disabled: boolean;
  source: unknown;
}
