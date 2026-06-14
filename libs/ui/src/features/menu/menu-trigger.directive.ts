import { computed, Directive, input } from '@angular/core';
import { Menu } from './menu';

@Directive({
  selector: '[tlsMenuTrigger]',
  host: {
    '(click)': 'onClick($event)',
    '[attr.aria-haspopup]': '"menu"',
    '[attr.aria-expanded]': 'isOpen()',
    '[attr.aria-controls]': 'menuId()',
  },
})
export class MenuTriggerDirective {
  public readonly menu = input.required<Menu>({ alias: 'tlsMenuTrigger' });

  protected readonly isOpen = computed(() => this.menu().isOpen());
  protected readonly menuId = computed(() => this.menu().id);

  // Protected methods
  protected onClick(event: MouseEvent): void {
    this.menu().toggle(event);
  }
}
