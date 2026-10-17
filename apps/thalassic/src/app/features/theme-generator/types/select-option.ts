/** A labelled value offered by a select. */
export interface SelectOption<T> {
  /** Text shown for the option. */
  label: string;
  /** Value the option selects. */
  value: T;
}
