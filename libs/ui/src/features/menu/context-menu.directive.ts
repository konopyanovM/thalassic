import { Directive, input } from '@angular/core';
import { Menu } from './menu';

@Directive({
  selector: '[tlsContextMenu]',
  host: {
    '(contextmenu)': 'onContextMenu($event)',
  },
})
export class ContextMenuDirective {
  public readonly menu = input.required<Menu>({ alias: 'tlsContextMenu' });

  // Protected methods
  protected onContextMenu(event: MouseEvent): void {
    event.preventDefault();
    this.menu().close();
    this.menu().openAtPoint(event.clientX, event.clientY);
  }
}
