/**
 * When a control's invalid state becomes visible (red styling and form-item error message).
 * `touched` surfaces it once the field has been blurred. `touched-dirty` additionally requires the
 * value to have changed, or the form around the field to have been submitted since the field was
 * last reset — the rule of the platform's `:user-invalid` — so leaving an untouched, empty field
 * stays silent until the user has engaged with it or asked for the form to be judged.
 */
export type errorTrigger = 'touched' | 'touched-dirty';

export interface FormControlConfig {
  errorTrigger: errorTrigger;
}

export const DEFAULT_FORM_CONTROL_CONFIG: FormControlConfig = {
  errorTrigger: 'touched',
};
