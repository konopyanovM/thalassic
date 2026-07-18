/**
 * When a control's invalid state becomes visible (red styling and form-item error message).
 * `touched` surfaces it once the field has been blurred; `touched-dirty` additionally requires the
 * value to have changed, so tabbing past an untouched, empty field stays silent until the user has
 * actually engaged with it.
 */
export type errorTrigger = 'touched' | 'touched-dirty';

export interface FormControlConfig {
  errorTrigger: errorTrigger;
}

export const DEFAULT_FORM_CONTROL_CONFIG: FormControlConfig = {
  errorTrigger: 'touched-dirty',
};
