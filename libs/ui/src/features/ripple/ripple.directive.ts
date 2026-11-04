import { MOTION_ATTRIBUTE } from '@thalassic/core';
import {
  booleanAttribute,
  computed,
  DestroyRef,
  Directive,
  DOCUMENT,
  ElementRef,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  Renderer2,
  Signal,
} from '@angular/core';
import { pointerType } from '../../types';
import { RippleConfig } from './ripple.config';
import { RIPPLE_CONFIG } from './ripple.token';
import {
  PRESS_SCALE_PROPERTY,
  RIPPLE_ACTIVE_CLASS,
  RIPPLE_DIAMETER_PROPERTY,
  RIPPLE_MOVE_SLOP_PX,
  RIPPLE_RELEASED_CLASS,
  RIPPLE_TOUCH_DELAY_MS,
  RIPPLE_X_PROPERTY,
  RIPPLE_Y_PROPERTY,
} from './ripple.constants';

/**
 * Spreads ink from the point of contact when the host is touched, and stands its
 * press down for that one interaction so a single tap produces a single effect.
 *
 * A touch and a pen ink by default, a mouse does not. Ink answers the fingertip
 * covering the control it is spreading from — a cursor occludes nothing, and a
 * mouse press is over in a fraction of the ink's duration, leaving most of it
 * playing after the button has already been released. Which pointers ink is set
 * app-wide through `RIPPLE_CONFIG` and per host through `ripplePointerTypes`.
 *
 * A touch inks a moment after it lands rather than at once, so a flick that
 * merely begins on the host scrolls without flashing it; a tap lifted sooner inks
 * on release. The ink spreads and holds while the contact lasts, so a held press
 * keeps showing, and fades when it ends.
 *
 * The ink is expressive and outlives the contact that spawned it, so it is
 * confined to the `full` motion level; below that the press it suppresses is
 * restored and acknowledges the touch instead. Removing this directive therefore
 * takes nothing away — the press underneath is pure CSS and is what a host shows
 * without it.
 *
 * Requires the theme's `ripple` mixin on the same element, which draws the ink
 * from the values written here.
 *
 * @example
 * ```html
 * <button class="tls-button" tlsRipple>Save</button>
 * ```
 */
@Directive({
  selector: '[tlsRipple]',
  host: {
    '(pointerdown)': 'onPointerDown($event)',
  },
})
export class RippleDirective {
  // Injections
  private readonly _elementRef: ElementRef<HTMLElement> = inject(ElementRef);
  private readonly _document: Document = inject(DOCUMENT);
  private readonly _config: RippleConfig = inject(RIPPLE_CONFIG);
  private readonly _renderer: Renderer2 = inject(Renderer2);

  // Inputs
  /**
   * Turns the ink off.
   *
   * Deliberately not named `disabled`: an input shadows the DOM property of the
   * same name on the element it sits on, so a directive claiming `disabled` would
   * capture a host's `[disabled]` binding and leave the control enabled.
   */
  public readonly rippleDisabled: InputSignalWithTransform<boolean, unknown> = input<
    boolean,
    unknown
  >(false, { transform: booleanAttribute });

  /**
   * Pointer types whose presses ink here, overriding the app-wide default for
   * this one host. Unset defers to `RIPPLE_CONFIG`.
   */
  public readonly ripplePointerTypes: InputSignal<pointerType[] | undefined> = input<
    pointerType[] | undefined
  >(undefined);

  // Computed
  private readonly _pointerTypes: Signal<pointerType[]> = computed(
    () => this.ripplePointerTypes() ?? this._config.pointerTypes,
  );

  // State
  /** Where the press landed, to measure a scroll against. */
  private _origin: { x: number; y: number } | null = null;
  /**
   * Teardown of the listeners that follow a press — its moves and its end — bound
   * only while one is live. Host listeners would schedule change detection for
   * every hover movement across every host, although only a press needs them.
   */
  private _stopTrackingContact: (() => void) | null = null;
  /** The ink a touch is waiting to strike, until the wait passes or the contact ends. */
  private _pendingInk: ReturnType<typeof setTimeout> | null = null;

  constructor() {
    inject(DestroyRef).onDestroy(() => this._stopTracking());
  }

  // Protected methods
  protected onPointerDown(event: PointerEvent): void {
    const host = this._elementRef.nativeElement;
    this._stopTracking();

    // Anything this directive does not ink is the press's to acknowledge, so the
    // suppression is lifted here rather than on release. `:active` outlives the
    // contact that set it: dropping the suppression at `pointerup` hands the
    // control back to a press that is still matching, which then depresses and
    // settles after the finger has already gone. Restoring it as a press begins
    // leaves no window to flash in.
    if (this.rippleDisabled() || !this._inksFor(event.pointerType) || !this._isFullMotion()) {
      host.classList.remove(RIPPLE_ACTIVE_CLASS, RIPPLE_RELEASED_CLASS);
      host.style.removeProperty(PRESS_SCALE_PROPERTY);
      return;
    }

    const bounds = host.getBoundingClientRect();
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;

    this._origin = { x: event.clientX, y: event.clientY };
    this._trackContact(host, event.pointerId);

    host.style.setProperty(RIPPLE_X_PROPERTY, `${x}px`);
    host.style.setProperty(RIPPLE_Y_PROPERTY, `${y}px`);
    host.style.setProperty(RIPPLE_DIAMETER_PROPERTY, `${this._radiusToCover(bounds, x, y)}px`);

    // Press and ink both answer the same contact; the ink is the louder of the
    // two, so the press stands down rather than playing underneath it — from the
    // moment the contact lands, so a press waiting to ink does not depress first.
    host.style.setProperty(PRESS_SCALE_PROPERTY, '1');

    if (event.pointerType !== 'touch') {
      this._restartInk(host);
      return;
    }

    this._pendingInk = setTimeout(() => {
      this._pendingInk = null;
      this._restartInk(host);
    }, RIPPLE_TOUCH_DELAY_MS);
  }

  // Private methods
  /** A tap lifted before its ink was struck inks now, and every ink lets go with the contact. */
  private _onPointerRelease(): void {
    const host = this._elementRef.nativeElement;

    if (this._pendingInk) {
      this._clearPendingInk();
      this._restartInk(host);
    }

    this._stopTracking();
    this._release(host);
  }

  /**
   * The browser took the contact over, most often for a scroll: an ink still waiting is
   * dropped, and one already spreading fades as on release.
   */
  private _onPointerCancel(): void {
    const struck = !this._pendingInk;

    this._stopTracking();
    if (struck) this._release(this._elementRef.nativeElement);
  }

  private _onPointerMove(event: PointerEvent): void {
    const origin = this._origin;
    if (!origin) return;

    const travelled = Math.hypot(event.clientX - origin.x, event.clientY - origin.y);
    if (travelled <= RIPPLE_MOVE_SLOP_PX) return;

    // The press turned out to be a scroll. The ink goes immediately — or is never
    // struck, if the wait has not passed — but the press stays suppressed until
    // the contact ends: restoring it here would depress the control mid-scroll,
    // which is what the ink was cancelled for.
    this._stopTracking();
    this._elementRef.nativeElement.classList.remove(RIPPLE_ACTIVE_CLASS, RIPPLE_RELEASED_CLASS);
  }

  /**
   * Follows one press until it ends. Its end is heard on the document rather than the host:
   * only a touch is captured by the element it lands on, so a pen — or a mouse, where one
   * inks — lifted after sliding off the host would otherwise never release the ink it holds.
   * The capture phase hears the end even where a component stops it from bubbling.
   */
  private _trackContact(host: HTMLElement, pointerId: number): void {
    const onEnd = (event: PointerEvent): void => {
      if (event.pointerId !== pointerId) return;

      if (event.type === 'pointerup') {
        this._onPointerRelease();
      } else {
        this._onPointerCancel();
      }
    };
    const stopMoves = this._renderer.listen(host, 'pointermove', (event: PointerEvent) =>
      this._onPointerMove(event),
    );
    const stopRelease = this._renderer.listen(this._document, 'pointerup', onEnd, { capture: true });
    const stopCancel = this._renderer.listen(this._document, 'pointercancel', onEnd, {
      capture: true,
    });

    this._stopTrackingContact = () => {
      stopMoves();
      stopRelease();
      stopCancel();
    };
  }

  private _stopTracking(): void {
    this._origin = null;
    this._clearPendingInk();
    if (!this._stopTrackingContact) return;

    this._stopTrackingContact();
    this._stopTrackingContact = null;
  }

  /**
   * Whether a press from this kind of pointer inks. `pointerType` is read off the
   * event rather than from a media query so a device carrying both a touchscreen
   * and a mouse is answered by the one in use, not by the one it reports as
   * primary.
   */
  private _inksFor(pointer: string): boolean {
    return this._pointerTypes().some(allowed => allowed === pointer);
  }

  /**
   * Whether the document is at the motion level the ink belongs to.
   *
   * Read from the attribute the stylesheet gates on rather than from
   * `MotionService`, for two reasons: the two can never disagree about a level
   * they read from one place, and a host is not made to depend on a provider it
   * would otherwise never need — an app that never configures motion has no
   * attribute, and the ink is off exactly as the stylesheet has it.
   */
  private _isFullMotion(): boolean {
    return this._document.documentElement.getAttribute(MOTION_ATTRIBUTE) === 'full';
  }

  /**
   * Distance from the contact point to the farthest corner. The ink is struck
   * where the finger landed, so a press near an edge has farther to travel than
   * one in the middle; covering the control means reaching that corner.
   */
  private _radiusToCover(bounds: DOMRect, x: number, y: number): number {
    const horizontal = Math.max(x, bounds.width - x);
    const vertical = Math.max(y, bounds.height - y);

    return Math.hypot(horizontal, vertical);
  }

  /**
   * Retriggers the animation. A class already present does not restart a running
   * animation, so a second tap arriving before the first has faded would
   * otherwise be swallowed; reading back a layout property between the removal
   * and the addition forces the two to land as separate states.
   */
  private _restartInk(host: HTMLElement): void {
    host.classList.remove(RIPPLE_ACTIVE_CLASS, RIPPLE_RELEASED_CLASS);
    void host.offsetWidth;
    host.classList.add(RIPPLE_ACTIVE_CLASS);
  }

  /**
   * Lets the ink go. Its held strength is read back first: the fade is a transition from
   * that strength, and an ink struck and released in one go — a quick tap — would otherwise
   * have no style at full strength to fade from, and vanish without being seen.
   */
  private _release(host: HTMLElement): void {
    if (!host.classList.contains(RIPPLE_ACTIVE_CLASS)) return;

    void getComputedStyle(host, '::before').opacity;
    host.classList.add(RIPPLE_RELEASED_CLASS);
  }

  private _clearPendingInk(): void {
    if (!this._pendingInk) return;

    clearTimeout(this._pendingInk);
    this._pendingInk = null;
  }
}
