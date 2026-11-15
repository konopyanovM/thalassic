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
  POSITIONED_VALUES,
  PRESS_SCALE_PROPERTY,
  RIPPLE_ACTIVE_CLASS,
  RIPPLE_DIAMETER_PROPERTY,
  RIPPLE_MINIMUM_HOLD_MS,
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
 * keeps showing, and fades when it ends — whether the finger lifts or the browser
 * takes the contact over for a scroll — but never before it has shown for a
 * moment, so a quick tap is seen. A finger shifting on the control once its ink
 * is struck is still pressing it and leaves the ink in place.
 *
 * The ink is expressive and outlives the contact that spawned it, so it is
 * confined to the `full` motion level; below that the press it suppresses is
 * restored and acknowledges the touch instead. Removing this directive therefore
 * takes nothing away — the press underneath is pure CSS and is what a host shows
 * without it.
 *
 * Requires the theme's `ripple` mixin on the element the ink is drawn on — the
 * host, or the `rippleSurface` it names — which draws the ink from the values
 * written there.
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

  /**
   * The element the ink is drawn on, when it is not the host itself: a part of the control
   * that carries its shape, such as a navigation item's indicator pill around its icon. The
   * whole host still answers the press, and still stands its own press down. Unset draws on
   * the host.
   */
  public readonly rippleSurface: InputSignal<HTMLElement | undefined> = input<
    HTMLElement | undefined
  >(undefined);

  // Computed
  private readonly _pointerTypes: Signal<pointerType[]> = computed(
    () => this.ripplePointerTypes() ?? this._config.pointerTypes,
  );

  // State
  /** Where a touch waiting to ink landed, to measure a scroll against. */
  private _origin: { x: number; y: number } | null = null;
  /**
   * Teardown of the listeners that hear a press end, bound only while one is live.
   * Host listeners would schedule change detection for every hover movement across
   * every host, although only a press needs them.
   */
  private _stopTrackingContact: (() => void) | null = null;
  /** Teardown of the listener that watches a touch's travel while it waits to ink. */
  private _stopWatchingForScroll: (() => void) | null = null;
  /** The ink a touch is waiting to strike, until the wait passes or the contact ends. */
  private _pendingInk: ReturnType<typeof setTimeout> | null = null;
  /** Runs from the moment ink is struck until it has shown for its minimum hold. */
  private _minimumHold: ReturnType<typeof setTimeout> | null = null;
  /** Whether the contact ended while the minimum hold was still running, so the ink fades once it does. */
  private _releaseAwaitingHold = false;

  constructor() {
    inject(DestroyRef).onDestroy(() => {
      this._stopTracking();
      this._clearHold();
    });
  }

  // Protected methods
  protected onPointerDown(event: PointerEvent): void {
    const host = this._elementRef.nativeElement;
    const surface = this._surface();
    this._stopTracking();
    // Ink an earlier contact left on the surface fades as this one lands, rather than
    // waiting out its hold while this contact decides whether it is a scroll.
    this._letGo(surface);

    // Anything this directive does not ink is the press's to acknowledge, so the
    // suppression is lifted here rather than on release. `:active` outlives the
    // contact that set it: dropping the suppression at `pointerup` hands the
    // control back to a press that is still matching, which then depresses and
    // settles after the finger has already gone. Restoring it as a press begins
    // leaves no window to flash in.
    if (this.rippleDisabled() || !this._inksFor(event.pointerType) || !this._isFullMotion()) {
      surface.classList.remove(RIPPLE_ACTIVE_CLASS, RIPPLE_RELEASED_CLASS);
      host.style.removeProperty(PRESS_SCALE_PROPERTY);
      return;
    }

    const bounds = this._inkLayerBounds(surface);
    const x = event.clientX - bounds.left;
    const y = event.clientY - bounds.top;

    this._trackContact(event.pointerId);

    surface.style.setProperty(RIPPLE_X_PROPERTY, `${x}px`);
    surface.style.setProperty(RIPPLE_Y_PROPERTY, `${y}px`);
    surface.style.setProperty(RIPPLE_DIAMETER_PROPERTY, `${this._radiusToCover(bounds, x, y)}px`);

    // Press and ink both answer the same contact; the ink is the louder of the
    // two, so the press stands down rather than playing underneath it — from the
    // moment the contact lands, so a press waiting to ink does not depress first.
    host.style.setProperty(PRESS_SCALE_PROPERTY, '1');

    if (event.pointerType !== 'touch') {
      this._strike(surface);
      return;
    }

    this._awaitScroll(host, surface, event);
  }

  // Private methods
  /** A tap lifted before its ink was struck inks now, and every ink lets go with the contact. */
  private _onPointerRelease(): void {
    const surface = this._surface();

    if (this._pendingInk) {
      this._clearPendingInk();
      this._strike(surface);
    }

    this._stopTracking();
    this._release(surface);
  }

  /**
   * The browser took the contact over, most often for a scroll: an ink still waiting is
   * dropped, and one already spreading fades as on release.
   */
  private _onPointerCancel(): void {
    const struck = !this._pendingInk;

    this._stopTracking();
    if (struck) this._release(this._surface());
  }

  /**
   * A touch that travels past the slop while it waits has turned out to be a scroll, so it
   * never inks. The press stays suppressed until the contact ends: restoring it here would
   * depress the control mid-scroll, which is what the ink was withheld for.
   */
  private _onPointerMove(event: PointerEvent): void {
    const origin = this._origin;
    if (!origin) return;

    const travelled = Math.hypot(event.clientX - origin.x, event.clientY - origin.y);
    if (travelled <= RIPPLE_MOVE_SLOP_PX) return;

    this._stopTracking();
  }

  /**
   * Holds a touch's ink back for the wait, watching how far the touch travels meanwhile. Its
   * moves are heard on the host, which captures a touch for as long as it lasts.
   */
  private _awaitScroll(host: HTMLElement, surface: HTMLElement, startEvent: PointerEvent): void {
    this._origin = { x: startEvent.clientX, y: startEvent.clientY };
    this._stopWatchingForScroll = this._renderer.listen(host, 'pointermove', (event: PointerEvent) =>
      this._onPointerMove(event),
    );
    this._pendingInk = setTimeout(() => {
      this._clearPendingInk();
      this._strike(surface);
    }, RIPPLE_TOUCH_DELAY_MS);
  }

  /**
   * Follows one press until it ends. Its end is heard on the document rather than the host:
   * only a touch is captured by the element it lands on, so a pen — or a mouse, where one
   * inks — lifted after sliding off the host would otherwise never release the ink it holds.
   * The capture phase hears the end even where a component stops it from bubbling.
   */
  private _trackContact(pointerId: number): void {
    const onEnd = (event: PointerEvent): void => {
      if (event.pointerId !== pointerId) return;

      if (event.type === 'pointerup') {
        this._onPointerRelease();
      } else {
        this._onPointerCancel();
      }
    };
    const stopRelease = this._renderer.listen(this._document, 'pointerup', onEnd, { capture: true });
    const stopCancel = this._renderer.listen(this._document, 'pointercancel', onEnd, {
      capture: true,
    });

    this._stopTrackingContact = () => {
      stopRelease();
      stopCancel();
    };
  }

  /** Stops following the live contact, dropping any ink it is still waiting to strike. */
  private _stopTracking(): void {
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

  /** The element the ink is drawn on. */
  private _surface(): HTMLElement {
    return this.rippleSurface() ?? this._elementRef.nativeElement;
  }

  /**
   * The box the ink layer occupies, which the contact point and the ink's reach are measured
   * against. The layer is laid out against the surface, unless the surface is not positioned:
   * it is then laid out against the nearest positioned ancestor instead — a stretched link
   * inks the whole row its hit area covers, not just its own text. Its insets are read back
   * rather than assumed to be zero, so a layer that bleeds past that box is measured as drawn.
   */
  private _inkLayerBounds(surface: HTMLElement): DOMRect {
    const container = POSITIONED_VALUES.has(getComputedStyle(surface).position)
      ? surface
      : (surface.offsetParent ?? surface);
    const bounds = container.getBoundingClientRect();
    const layer = getComputedStyle(surface, '::before');
    // An inset that does not resolve to a length — the layer is not laid out — reads as none.
    const top = parseFloat(layer.top) || 0;
    const right = parseFloat(layer.right) || 0;
    const bottom = parseFloat(layer.bottom) || 0;
    const left = parseFloat(layer.left) || 0;

    return new DOMRect(
      bounds.left + left,
      bounds.top + top,
      bounds.width - left - right,
      bounds.height - top - bottom,
    );
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
   * Strikes fresh ink and starts its minimum hold. A class already present does not
   * restart a running animation, so a second tap arriving before the first has
   * faded would otherwise be swallowed; reading back a layout property between the
   * removal and the addition forces the two to land as separate states.
   */
  private _strike(surface: HTMLElement): void {
    this._clearHold();
    surface.classList.remove(RIPPLE_ACTIVE_CLASS, RIPPLE_RELEASED_CLASS);
    void surface.offsetWidth;
    surface.classList.add(RIPPLE_ACTIVE_CLASS);

    this._minimumHold = setTimeout(() => {
      this._minimumHold = null;
      if (this._releaseAwaitingHold) this._letGo(surface);
    }, RIPPLE_MINIMUM_HOLD_MS);
  }

  /**
   * Answers the end of the contact: the ink fades now if it has shown for its minimum hold,
   * and once it has otherwise.
   *
   * @example
   * // A tap lifted 40ms after the ink was struck, with a 225ms hold:
   * //   0ms  struck
   * //  40ms  release   → awaits the hold
   * // 225ms  hold ends → fades
   * // A press held for 600ms:
   * // 600ms  release   → fades at once
   */
  private _release(surface: HTMLElement): void {
    if (!surface.classList.contains(RIPPLE_ACTIVE_CLASS)) return;

    if (this._minimumHold) {
      this._releaseAwaitingHold = true;
      return;
    }

    this._letGo(surface);
  }

  /** Fades whatever ink the surface holds, ending any hold still running. */
  private _letGo(surface: HTMLElement): void {
    this._clearHold();
    if (!surface.classList.contains(RIPPLE_ACTIVE_CLASS)) return;

    surface.classList.add(RIPPLE_RELEASED_CLASS);
  }

  /** Ends a touch's wait to ink, along with the watch on its travel. */
  private _clearPendingInk(): void {
    this._origin = null;

    if (this._stopWatchingForScroll) {
      this._stopWatchingForScroll();
      this._stopWatchingForScroll = null;
    }

    if (!this._pendingInk) return;

    clearTimeout(this._pendingInk);
    this._pendingInk = null;
  }

  /** Ends the minimum hold, along with any release that was waiting on it. */
  private _clearHold(): void {
    this._releaseAwaitingHold = false;
    if (!this._minimumHold) return;

    clearTimeout(this._minimumHold);
    this._minimumHold = null;
  }
}
