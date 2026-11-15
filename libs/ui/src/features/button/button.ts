import { LocationStrategy, NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  Signal,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { POPUP_TRIGGER, POPUP_TRIGGER_FORWARDED } from '../../abstract/popup-trigger';
import { Loader } from '../loader';
import { RippleDirective } from '../ripple';
import { ButtonBase } from './button.base';
import { buttonType } from './button.types';

@Component({
  selector: 'tls-button',
  imports: [Loader, NgTemplateOutlet, RippleDirective],
  templateUrl: './button.html',
  // The focusable control is the inner `button`/`a`, which carries a trigger's announcement.
  providers: [{ provide: POPUP_TRIGGER_FORWARDED, useValue: true }],
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
  /**
   * The popup a trigger directive on this button opens. The host is a wrapper, so the trigger's
   * announcement is placed on the inner control, the element that takes focus.
   */
  private readonly _popupTrigger = inject(POPUP_TRIGGER, { self: true, optional: true });

  /**
   * The interactive control is the inner `button`/`a`; the host is a wrapper.
   */
  protected override HOST_IS_CONTROL = false;

  // Inputs
  /**
   * Marks the button as working on the action it started — a submission in flight, say. A
   * spinner stands in for the label, which keeps its place so the button holds its size, the
   * control reports `aria-busy`, and further activation is refused; unlike `disabled` it keeps
   * focus and its place in the tab order, so the person who pressed it is not stranded.
   */
  public readonly busy: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    false,
    { transform: booleanAttribute },
  );

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

  /** `aria-haspopup` for the inner control: the kind of popup a trigger on the button opens. */
  protected readonly popupKind: string | null = this._popupTrigger
    ? this._popupTrigger.popupKind
    : null;

  /** `aria-expanded` for the inner control, while a trigger on the button reports one. */
  protected readonly popupExpanded = computed<boolean | null>(() =>
    this._popupTrigger ? this._popupTrigger.popupExpanded() : null,
  );

  /** `aria-controls` for the inner control: the open popup a trigger on the button points at. */
  protected readonly popupId = computed<string | null>(() =>
    this._popupTrigger ? this._popupTrigger.popupId() : null,
  );

  /**
   * Resolved URL placed on the inner anchor so the browser treats it as a real link
   * (enables "Open in new tab", middle-click, status-bar preview, etc.). An explicit
   * `href` wins; otherwise the URL is derived from the host `routerLink`.
   */
  protected linkHref: Signal<string | null> = computed<string | null>(() => {
    if (this.unavailable()) return null;

    const explicitHref = this.href();
    if (explicitHref) return explicitHref;

    const urlTree = this._routerLink?.urlTree;
    if (!urlTree || !this._router) return null;

    const serialized = this._router.serializeUrl(urlTree);
    return this._locationStrategy?.prepareExternalUrl(serialized) ?? serialized;
  });

  // Protected methods
  /**
   * Stops a click on an inactive button at the control, so it never reaches a
   * consumer's handler on the host. A natively disabled button dispatches no
   * click at all; one held focusable by `inactive` does, and the refusal has to
   * be made here.
   */
  protected onControlClick(event: MouseEvent): void {
    if (!this.inactive() && !this.busy()) return;

    event.preventDefault();
    event.stopPropagation();
  }

  /**
   * Keeps navigation correct when the host carries a `routerLink` while the inner anchor
   * exposes a real `href`:
   *  - modified / non-primary clicks bubble to the browser so it can open a new tab, and
   *    are stopped from reaching the host RouterLink to avoid a duplicate in-app navigation;
   *  - a plain left click defers to the host RouterLink for SPA navigation, so the anchor's
   *    own full-page navigation is prevented.
   */
  protected onLinkClick(event: MouseEvent): void {
    if (this.unavailable() || this.busy()) {
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
