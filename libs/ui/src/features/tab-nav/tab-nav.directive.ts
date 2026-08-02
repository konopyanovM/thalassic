import {
  booleanAttribute,
  computed,
  Directive,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  Signal,
} from '@angular/core';
import { tabsItemsAlign, tabsOrientation, tabsVariant } from '../tabs';
import { TabNavConfig } from './tab-nav.config';
import { TAB_NAV_CONFIG } from './tab-nav.token';

/**
 * Tab-styled navigation strip: a `<nav>` of router links that shares the
 * tab-header visuals of `tls-tabs` while keeping link semantics.
 *
 * Unlike `tls-tabs`, this is deliberately not a `tablist` — links that
 * navigate to routes have no tabpanels, so per the WAI-ARIA guidance they
 * stay a navigation landmark with `aria-current="page"` on the active link
 * (set by `tlsTabLink`). Sitting on the consumer's own `<nav>`, the landmark
 * role and `aria-label` apply natively and need no forwarding.
 *
 * ```html
 * <nav tlsTabNav aria-label="Settings">
 *   <a tlsTabLink routerLink="profile" routerLinkActive>Profile</a>
 *   <a tlsTabLink routerLink="security" routerLinkActive>Security</a>
 * </nav>
 * ```
 *
 * Set `divider` to draw a separator between every pair of links. The
 * separators are presentational only — they carry no semantics and are not
 * announced to assistive technology.
 */
@Directive({
  selector: 'nav[tlsTabNav]',
  host: {
    '[class]': 'hostClasses()',
  },
})
export class TabNavDirective {
  // Injections
  private readonly _config: TabNavConfig = inject(TAB_NAV_CONFIG);

  // Inputs
  public readonly variant: InputSignal<tabsVariant> = input<tabsVariant>(this._config.variant);
  public readonly orientation: InputSignal<tabsOrientation> = input<tabsOrientation>(
    this._config.orientation,
  );
  public readonly itemsAlign: InputSignal<tabsItemsAlign> = input<tabsItemsAlign>(
    this._config.itemsAlign,
  );
  public readonly divider: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.divider,
    { transform: booleanAttribute },
  );

  // Computed
  protected hostClasses: Signal<string[]> = computed(() => {
    const className = 'tls-tab-header';

    const array: string[] = ['tls-tab-nav', className];

    array.push(`${className}--${this.variant()}`);
    array.push(`${className}--${this.orientation()}`);
    array.push(`${className}--items-${this.itemsAlign()}`);

    if (this.divider()) array.push(`${className}--divided`);

    return array;
  });
}
