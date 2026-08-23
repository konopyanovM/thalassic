import { Menu as AriaMenu, MenuItem as AriaMenuItem } from '@angular/aria/menu';
import { NgTemplateOutlet } from '@angular/common';
import {
  Component,
  contentChild,
  effect,
  ElementRef,
  inject,
  input,
  InputSignal,
  signal,
  TemplateRef,
  viewChild,
} from '@angular/core';
import { color } from '../../types';
import { Button } from '../button';
import { Icon } from '../icon';
import { FabMenuItemDefinition } from './fab-menu.types';

/**
 * A speed-dial FAB: a floating action button whose tap fans a vertical stack
 * of labelled pill actions out above it, one per item. The projected content
 * is the trigger's glyph, which turns while the menu is open (a `+` reads as a
 * close cross). The consumer positions the host — the host *is* the FAB.
 *
 * Reserve it for a FAB whose action genuinely forks into a small set of
 * choices; a single-action FAB stays a plain `tls-button [fab]`, and a
 * non-floating trigger takes a `tls-menu`.
 */
@Component({
  selector: 'tls-fab-menu',
  imports: [NgTemplateOutlet, AriaMenu, AriaMenuItem, Button, Icon],
  templateUrl: './fab-menu.html',
  host: {
    class: 'tls-fab-menu',
    '[class.tls-fab-menu--open]': 'isOpen()',
    '(document:click)': 'onDocumentClick($event)',
  },
})
export class FabMenu {
  private static _counter = 0;

  private readonly _elementRef = inject(ElementRef<HTMLElement>);

  // The stack exists only while open, so the ref doubles as "is it rendered".
  private readonly _itemsList = viewChild<ElementRef<HTMLElement>>('itemsList');
  private readonly _trigger = viewChild.required('trigger', {
    read: ElementRef<HTMLElement>,
  });

  /**
   * Leading icon of every item, rendered instead of the item's `icon` source —
   * the slot for consumers whose icons are components rather than sources.
   * Receives the item as `$implicit`.
   */
  protected readonly iconTemplate = contentChild<TemplateRef<unknown>>('itemIcon');

  public readonly id = `tls-fab-menu-${++FabMenu._counter}`;

  // Inputs
  public readonly items: InputSignal<FabMenuItemDefinition[]> = input<FabMenuItemDefinition[]>([]);
  /** Accessible name shared by the trigger and the menu it opens. */
  public readonly ariaLabel: InputSignal<string | undefined> = input<string | undefined>(undefined);
  public readonly color: InputSignal<color> = input<color>('primary');

  private readonly _open = signal(false);
  public readonly isOpen = this._open.asReadonly();

  constructor() {
    // Focus moves into the stack once it renders, so arrow keys walk the items
    // right away; the viewChild resolves only after the conditional list exists.
    effect(() => {
      const list = this._itemsList();
      if (list && this._open()) list.nativeElement.focus();
    });
  }

  // Public methods
  public open(): void {
    this._open.set(true);
  }

  /** Closes the stack; `refocusTrigger` hands focus back for a keyboard dismissal. */
  public close(refocusTrigger = false): void {
    this._open.set(false);
    if (!refocusTrigger) return;

    // The trigger is a component host; the focusable control is its inner button.
    const button = this._trigger().nativeElement.querySelector('button');
    if (button) button.focus();
  }

  public toggle(): void {
    if (this._open()) {
      this.close();
    } else {
      this.open();
    }
  }

  // Protected methods
  protected onItemSelected(item: FabMenuItemDefinition): void {
    item.action?.();
    this.close();
  }

  // A tap outside the component dismisses the stack; one inside it is the
  // trigger's own toggle or an item selection, each already handled.
  protected onDocumentClick(event: MouseEvent): void {
    if (!this._open()) return;
    if (this._elementRef.nativeElement.contains(event.target as Node)) return;

    this._open.set(false);
  }
}
