import { Directive } from '@angular/core';

/**
 * Marks the heading that titles a dialog, styling it to the dialog type scale.
 */
@Directive({
  selector: '[tlsDialogTitle]',
  host: {
    class: 'tls-dialog__title',
  },
})
export class DialogTitleDirective {}
