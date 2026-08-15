import { LocationStrategy, NgTemplateOutlet } from '@angular/common';
import { Component, computed, inject, input, InputSignal, Signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { RippleDirective } from '../ripple';
import { ButtonBase } from './button.base';
import { buttonType } from './button.types';

@Component({
  selector: 'tls-button',
  imports: [NgTemplateOutlet, RippleDirective],
  templateUrl: './button.html',
  host: {
    '[tabindex]': '-1',
  },
  styleUrl: './button.scss',
})
export class Button extends ButtonBase {
  // Injections
  private _routerLink = inject(RouterLink, { optional: true });
  private _router = inject(Router, { optional: true });
  private _locationStrategy = inject(LocationStrategy, { optional: true });

  protected override APPLY_HOST_CLASSES = false;

  // Inputs
  /** The text label displayed inside the button. Takes priority over projected content. */
  public readonly label = input<string>();

  /**
   * Accessible name forwarded to the inner `<button>`/`<a>`. Required for icon-only buttons,
   * where there is no visible text for screen readers to announce. Placed on the inner control
   * because the host `tls-button` element is a non-interactive wrapper.
   */
  public readonly ariaLabel = input<string | undefined>(undefined);

  /**
   * `id` of an element whose text names the inner `<button>`/`<a>`, for when the accessible
   * name already exists as visible text. Takes precedence over `ariaLabel` per the ARIA spec.
   */
  public readonly ariaLabelledby = input<string | undefined>(undefined);

  public readonly type: InputSignal<buttonType> = input<buttonType>(this._config.type);

  /** An optional URL that causes the button to render as an anchor link. */
  public readonly href = input<string | null>(null);
  public readonly tabindex = input<string>('0');

  // Computed
  protected isLink = computed<boolean>(() => Boolean(this._routerLink || this.href()));

  /**
   * Resolved URL placed on the inner anchor so the browser treats it as a real link
   * (enables "Open in new tab", middle-click, status-bar preview, etc.). An explicit
   * `href` wins; otherwise the URL is derived from the host `routerLink`.
   */
  protected linkHref: Signal<string | null> = computed<string | null>(() => {
    if (this.disabled()) return null;

    const explicitHref = this.href();
    if (explicitHref) return explicitHref;

    const urlTree = this._routerLink?.urlTree;
    if (!urlTree || !this._router) return null;

    const serialized = this._router.serializeUrl(urlTree);
    return this._locationStrategy?.prepareExternalUrl(serialized) ?? serialized;
  });

  // Protected methods
  /**
   * Keeps navigation correct when the host carries a `routerLink` while the inner anchor
   * exposes a real `href`:
   *  - modified / non-primary clicks bubble to the browser so it can open a new tab, and
   *    are stopped from reaching the host RouterLink to avoid a duplicate in-app navigation;
   *  - a plain left click defers to the host RouterLink for SPA navigation, so the anchor's
   *    own full-page navigation is prevented.
   */
  protected onLinkClick(event: MouseEvent): void {
    if (this.disabled()) {
      event.preventDefault();
      event.stopPropagation();
      return;
    }

    // Pure href links (no routerLink) navigate natively — nothing to coordinate.
    if (!this._routerLink) return;

    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) {
      event.stopPropagation();
      return;
    }

    event.preventDefault();
  }
}
