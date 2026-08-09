export type labelPosition = 'top' | 'start' | 'end';

/** Context handed to a custom label template, rendered inside the form item's own `<label>`. */
export interface FormItemLabelContext {
  /** Label text of the item, `undefined` when only a template supplies the label. */
  $implicit: string | undefined;
  /** Whether the control is required and the required marker is enabled. */
  required: boolean;
  /** Optional-field text to render, `undefined` when the control is required or the text is unset. */
  optionalText: string | undefined;
  /** Whether the control is currently showing a validation error. */
  invalid: boolean;
}
