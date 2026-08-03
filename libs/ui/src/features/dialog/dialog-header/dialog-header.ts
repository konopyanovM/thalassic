import { Component } from '@angular/core';

/**
 * Top region of a dialog, holding its title and any supporting text. Keeps its
 * padding out of the scrolling body so the title stays put while the content
 * scrolls under it.
 */
@Component({
  selector: 'tls-dialog-header',
  imports: [],
  template: '<ng-content></ng-content>',
  host: {
    class: 'tls-dialog__header',
  },
})
export class DialogHeader {}
