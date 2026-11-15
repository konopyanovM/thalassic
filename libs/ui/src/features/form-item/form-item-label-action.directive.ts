import { Directive } from '@angular/core';

/**
 * Marks content a form item draws at the far end of its label's row — an action that concerns
 * the field, such as a "Forgot password?" link beside a password's label. It sits beside the
 * `<label>` element rather than inside it, so it takes no part in the control's accessible name,
 * and a press on it never reaches the control. It follows the control in the document, so focus
 * reaches the field before the action beside its label. Meant for a label placed above its
 * control.
 */
@Directive({
  selector: '[tlsFormItemLabelAction]',
})
export class FormItemLabelAction {}
