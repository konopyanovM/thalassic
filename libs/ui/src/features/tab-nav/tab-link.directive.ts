import {
  booleanAttribute,
  computed,
  Directive,
  inject,
  input,
  InputSignalWithTransform,
  Signal,
  signal,
} from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { RouterLinkActive } from '@angular/router';

/**
 * One link inside a `nav[tlsTabNav]` strip. The anchor plays both tab-header
 * roles at once (item and control), so it carries both element classes.
 *
 * Active state comes from `RouterLinkActive` when the directive sits on the
 * same anchor (`routerLinkActive` attribute alongside `routerLink`), with the
 * `active` input as an explicit override for non-router links. The active
 * link is exposed to assistive technology via `aria-current="page"`.
 */
@Directive({
  selector: 'a[tlsTabLink]',
  host: {
    class: 'tls-tab-header__item tls-tab-header__item-control',
    '[class.tls-tab-header__item--active]': 'isActive()',
    '[class.tls-tab-header__item--disabled]': 'disabled()',
    '[attr.aria-current]': "isActive() ? 'page' : null",
    '[attr.aria-disabled]': "disabled() ? 'true' : null",
    '[attr.tabindex]': 'disabled() ? -1 : null',
    '(click)': 'handleClick($event)',
  },
})
export class TabLinkDirective {
  // Injections
  private readonly _routerLinkActive: RouterLinkActive | null = inject(RouterLinkActive, {
    optional: true,
    self: true,
  });

  // Inputs
  public readonly active: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );
  public readonly disabled: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );

  // State
  private readonly _routerLinkIsActive: Signal<boolean> = this._routerLinkActive
    ? toSignal(this._routerLinkActive.isActiveChange, {
        initialValue: this._routerLinkActive.isActive,
      })
    : signal(false);

  // Computed
  protected isActive: Signal<boolean> = computed(
    () => this.active() || this._routerLinkIsActive(),
  );

  // Protected methods
  protected handleClick(event: MouseEvent): void {
    if (this.disabled()) event.preventDefault();
  }
}
