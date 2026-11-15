import { computed, Directive, inject, input } from '@angular/core';
import {
  POPUP_TRIGGER,
  POPUP_TRIGGER_FORWARDED,
  PopupTrigger,
} from '../../abstract/popup-trigger';
import { Menu } from './menu';

/**
 * Makes its host the control that opens a menu, and announces the menu it controls and whether
 * it is open. On a host that renders its own focusable control — a `tls-button` — that control
 * carries the announcement; on any other host, the host itself does.
 */
@Directive({
  selector: '[tlsMenuTrigger]',
  providers: [{ provide: POPUP_TRIGGER, useExisting: MenuTriggerDirective }],
  host: {
    '(click)': 'onClick($event)',
    '[attr.aria-haspopup]': 'announcesOnHost ? popupKind : null',
    '[attr.aria-expanded]': 'announcesOnHost ? popupExpanded() : null',
    '[attr.aria-controls]': 'announcesOnHost ? popupId() : null',
  },
})
export class MenuTriggerDirective implements PopupTrigger {
  // Injections
  /** Whether the host is the focusable control itself, rather than a button wrapping one. */
  protected readonly announcesOnHost = !inject(POPUP_TRIGGER_FORWARDED, {
    self: true,
    optional: true,
  });

  // Inputs
  public readonly menu = input.required<Menu>({ alias: 'tlsMenuTrigger' });

  // State
  public readonly popupKind = 'menu';

  // Computed
  public readonly popupExpanded = computed(() => this.menu().isOpen());
  /** The menu while it is open; a closed menu has no element to point at. */
  public readonly popupId = computed(() => (this.menu().isOpen() ? this.menu().id : null));

  // Protected methods
  protected onClick(event: MouseEvent): void {
    this.menu().toggle(event);
  }
}
