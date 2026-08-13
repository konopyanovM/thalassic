/**
 * Elements able to take focus on a control's behalf. Every control resolves to one of
 * these — a leaf `<input>` / `<textarea>` as much as a composite's trigger, which is
 * itself a native button or input — so a caller never has to know which component
 * rendered the control it is reaching for.
 */
export const FOCUSABLE_CONTROL_SELECTOR = 'input, textarea, select, button, [tabindex]';
