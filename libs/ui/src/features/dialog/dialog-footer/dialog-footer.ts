import { Component, computed, inject, input } from '@angular/core';
import { DIALOG_CONFIG } from '../dialog.token';
import { dialogFooterAlign } from '../dialog.types';

/**
 * Action region of a dialog, pinned below the scrolling body. Actions sit at
 * the end edge by default; `space-between` is the shape to reach for when a
 * destructive action belongs apart from the confirm/cancel pair.
 */
@Component({
  selector: 'tls-dialog-footer',
  imports: [],
  template: '<ng-content></ng-content>',
  host: { '[class]': 'hostClasses()' },
})
export class DialogFooter {
  // Injections
  private readonly _config = inject(DIALOG_CONFIG);

  // Inputs
  public readonly align = input<dialogFooterAlign>(this._config.footerAlign);

  // Computed
  protected readonly hostClasses = computed(() => [
    'tls-dialog__footer',
    `tls-dialog__footer--${this.align()}`,
  ]);
}
