import { Component } from '@angular/core';

/**
 * Scrolling content region of a dialog. Takes the space left between the header
 * and footer and scrolls internally, so a tall dialog keeps its title and
 * actions visible instead of growing past the viewport.
 */
@Component({
  selector: 'tls-dialog-body',
  imports: [],
  template: '<ng-content></ng-content>',
  host: {
    class: 'tls-dialog__body',
  },
})
export class DialogBody {}
