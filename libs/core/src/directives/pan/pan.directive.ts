import { Directionality } from '@angular/cdk/bidi';
import { isPlatformBrowser } from '@angular/common';
import {
  booleanAttribute,
  computed,
  DestroyRef,
  Directive,
  ElementRef,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  NgZone,
  output,
  PLATFORM_ID,
  Signal,
} from '@angular/core';
import { PAN_VELOCITY_WINDOW } from './pan.constants';
import { PAN_CONFIG } from './pan.token';
import { panAxis, panDirection, panEdge, PanEvent } from './pan.types';

interface PanSample {
  x: number;
  y: number;
  timeStamp: number;
}

/**
 * Normalized pointer pan gesture primitive.
 *
 * Reports the raw gesture stream — start, per-move snapshots, end, cancel — and
 * makes no decision about what the gesture means; that is the consumer's job
 * (or {@link SwipeDirective}'s, for the common "a swipe happened" case).
 *
 * Reliability characteristics:
 * - Sets its own `touch-action` from `axis` so the compositor never silently
 *   cancels the gesture because a consumer forgot it.
 * - The gesture stays undecided until the pointer travels `threshold` px, then
 *   axis-locks onto the dominant axis; a disallowed axis, or a scrollable
 *   ancestor with room to scroll in the locked direction, abandons the gesture
 *   and leaves the browser in control. `lockRatio` raises how decisively one
 *   axis must win, keeping ambiguous diagonals with the browser.
 * - A locked gesture holds the pointer for its whole life: the touch default is
 *   suppressed so the browser cannot start scrolling the cross axis partway
 *   through and cancel the drag.
 * - `pointermove` is handled outside the Angular zone; only `panStart`,
 *   `panEnd` and `panCancel` re-enter it.
 * - Velocity comes from a rolling sample window, so a slow drag ending in a
 *   fast flick reports the flick's velocity.
 * - RTL-aware via CDK `Directionality`: `logicalDirection` and the
 *   `start` / `end` edges resolve against the current layout direction.
 */
@Directive({
  selector: '[tlsPan]',
  host: {
    '[style.touch-action]': 'touchAction()',
    '(pointerdown)': 'onPointerDown($event)',
  },
})
export class PanDirective {
  // Injections
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _zone = inject(NgZone);
  private readonly _directionality = inject(Directionality);
  private readonly _destroyRef = inject(DestroyRef);
  private readonly _isBrowser: boolean = isPlatformBrowser(inject(PLATFORM_ID));
  // Fallbacks for every input, so a host with no template to bind from can be
  // configured through the injector instead. Declared before the inputs it seeds.
  private readonly _config = inject(PAN_CONFIG);

  // Inputs
  /** Enables the gesture. Bind `[tlsPan]="false"` to disable; the bare attribute enables. */
  public readonly tlsPan: InputSignalWithTransform<boolean, unknown> = input(this._config.enabled, {
    transform: booleanAttribute,
  });
  /** Axis (or axes) the gesture may lock onto. */
  public readonly axis: InputSignal<panAxis> = input<panAxis>(this._config.axis);
  /**
   * Whether the host's `touch-action` is set from `axis` so the browser yields
   * that axis to the gesture.
   *
   * Leave it on for a gesture that owns its axis outright. Turn it off for one
   * that has to share the axis with native scrolling — a gesture that engages
   * only where a scroll container has no room left to travel needs the browser
   * scrolling normally until that point, and `touch-action` resolves up the
   * ancestor chain, so claiming the axis anywhere above a scroller stops it
   * scrolling too. With it off the host's `touch-action` is left to CSS, and a
   * gesture that does lock still holds the pointer for the rest of its life.
   */
  public readonly manageTouchAction: InputSignalWithTransform<boolean, unknown> = input(
    this._config.manageTouchAction,
    { transform: booleanAttribute },
  );
  /** Slop in px the pointer must travel before the gesture axis-locks. */
  public readonly threshold: InputSignal<number> = input<number>(this._config.threshold);
  /**
   * How far the dominant axis must outweigh the other before the gesture locks
   * onto it. `1` locks on whichever component is larger; raise it (`1.5`, `2`)
   * to demand deliberate single-axis intent so an ambiguous diagonal is left to
   * the browser to scroll. Values below `1` have no effect beyond `1`.
   */
  public readonly lockRatio: InputSignal<number> = input<number>(this._config.lockRatio);
  /** When set, the gesture may only start within this edge zone of the host. */
  public readonly edge: InputSignal<panEdge | null> = input<panEdge | null>(this._config.edge);
  /** Width in px of the `edge` start zone. */
  public readonly edgeSize: InputSignal<number> = input<number>(this._config.edgeSize);
  /** Pointer types allowed to drive the gesture (e.g. `['touch']`); `null` allows all. */
  public readonly pointerTypes: InputSignal<readonly string[] | null> = input<
    readonly string[] | null
  >(this._config.pointerTypes);

  // Outputs
  /** Emits when the pointer crosses the slop threshold and the gesture axis-locks — not on `pointerdown`. */
  public readonly panStart = output<PanEvent>();
  /**
   * Emits for every pointer move after axis lock. Fired OUTSIDE the Angular
   * zone so tracking at pointer rate never triggers change detection per move —
   * write to a signal or to the DOM directly from the handler.
   */
  public readonly panMove = output<PanEvent>();
  /** Emits when the pointer is released while a gesture is active, with final rolling-window velocity. */
  public readonly panEnd = output<PanEvent>();
  /** Emits when the platform cancels an active gesture (e.g. the pointer is claimed by the OS). */
  public readonly panCancel = output<void>();

  // State
  private _pointerId: number | null = null;
  private _startX = 0;
  private _startY = 0;
  private _locked = false;
  private _lockedAxis: 'x' | 'y' | null = null;
  private _samples: PanSample[] = [];
  private _documentListenersAttached = false;
  // Body `user-select` value to restore after a locked gesture; `null` while no
  // suppression is active.
  private _previousBodyUserSelect: string | null = null;

  // Document-level listeners live for one gesture at a time; pre-bound once so
  // attach and detach always reference the same functions and allocate nothing
  // per gesture.
  private readonly _pointerMoveListener = (event: Event) =>
    this._onPointerMove(event as PointerEvent);
  private readonly _pointerUpListener = (event: Event) => this._onPointerUp(event as PointerEvent);
  private readonly _pointerCancelListener = (event: Event) =>
    this._onPointerCancel(event as PointerEvent);
  private readonly _touchMoveListener = (event: Event) => this._onTouchMove(event as TouchEvent);

  // Computed
  /**
   * `touch-action` the host needs so the browser leaves the permitted axis to
   * the gesture: a horizontal pan keeps native vertical scrolling (`pan-y`)
   * and vice versa; `both` claims the pointer entirely.
   */
  protected readonly touchAction: Signal<string | null> = computed(() => {
    if (!this.tlsPan() || !this.manageTouchAction()) return null;

    const axis = this.axis();
    if (axis === 'x') return 'pan-y';
    if (axis === 'y') return 'pan-x';
    return 'none';
  });

  constructor() {
    // Full reset rather than just detaching: a destroy mid-gesture must also
    // restore the suspended text selection.
    this._destroyRef.onDestroy(() => this._reset());
  }

  // Protected methods
  protected onPointerDown(event: PointerEvent): void {
    if (!this._isBrowser || !this.tlsPan()) return;
    // Only the primary pointer drives a gesture; a second finger going down
    // while one is active must not disturb it.
    if (this._pointerId !== null || !event.isPrimary) return;
    if (event.pointerType === 'mouse' && event.button !== 0) return;

    const pointerTypes = this.pointerTypes();
    if (pointerTypes !== null && !pointerTypes.includes(event.pointerType)) return;
    if (!this._isWithinEdge(event)) return;

    this._pointerId = event.pointerId;
    this._startX = event.clientX;
    this._startY = event.clientY;
    this._locked = false;
    this._lockedAxis = null;
    this._samples = [{ x: event.clientX, y: event.clientY, timeStamp: event.timeStamp }];
    this._attachDocumentListeners();
  }

  // Private methods
  /**
   * Move/up/cancel listeners live on the document — outside the Angular zone —
   * for the lifetime of one gesture. Before axis lock there is no pointer
   * capture, so element-level listeners would lose the pointer the moment it
   * leaves the host and the gesture state would never reset.
   */
  private _attachDocumentListeners(): void {
    if (this._documentListenersAttached) return;

    this._zone.runOutsideAngular(() => {
      const documentReference = this._elementRef.nativeElement.ownerDocument;
      documentReference.addEventListener('pointermove', this._pointerMoveListener, {
        passive: true,
      });
      documentReference.addEventListener('pointerup', this._pointerUpListener, { passive: true });
      documentReference.addEventListener('pointercancel', this._pointerCancelListener, {
        passive: true,
      });
      // The only non-passive listener, and attached for the gesture's lifetime
      // rather than permanently, so the document keeps its fast-path scrolling
      // whenever no gesture is in flight.
      documentReference.addEventListener('touchmove', this._touchMoveListener, { passive: false });
    });
    this._documentListenersAttached = true;
  }

  private _detachDocumentListeners(): void {
    if (!this._documentListenersAttached) return;

    const documentReference = this._elementRef.nativeElement.ownerDocument;
    documentReference.removeEventListener('pointermove', this._pointerMoveListener);
    documentReference.removeEventListener('pointerup', this._pointerUpListener);
    documentReference.removeEventListener('pointercancel', this._pointerCancelListener);
    documentReference.removeEventListener('touchmove', this._touchMoveListener);
    this._documentListenersAttached = false;
  }

  private _onPointerMove(event: PointerEvent): void {
    if (event.pointerId !== this._pointerId) return;
    // Disabling mid-gesture cancels it, rather than leaving the consumer with
    // a gesture that silently stops reporting.
    if (!this.tlsPan()) {
      this._cancelGesture(event);
      return;
    }

    const deltaX = event.clientX - this._startX;
    const deltaY = event.clientY - this._startY;

    this._recordSample(event);

    if (this._locked) {
      // Outside the Angular zone by design — see the `panMove` documentation.
      this.panMove.emit(this._createEvent(event, deltaX, deltaY));
      return;
    }

    if (Math.hypot(deltaX, deltaY) < this.threshold()) return;

    const dominantAxis = this._resolveDominantAxis(deltaX, deltaY);
    // Travel too diagonal to call stays undecided rather than abandoning the
    // gesture: a drag that begins ambiguously may still resolve to a clear axis
    // as it continues, and until it does the browser keeps the pointer.
    if (dominantAxis === null) return;

    const allowedAxis = this.axis();
    if (allowedAxis !== 'both' && dominantAxis !== allowedAxis) {
      this._reset();
      return;
    }
    if (this._hasScrollableAncestor(event, dominantAxis, deltaX, deltaY)) {
      this._reset();
      return;
    }

    this._locked = true;
    this._lockedAxis = dominantAxis;
    this._elementRef.nativeElement.setPointerCapture(event.pointerId);
    this._suppressTextSelection();

    const panEvent = this._createEvent(event, deltaX, deltaY);
    this._zone.run(() => this.panStart.emit(panEvent));
  }

  private _onPointerUp(event: PointerEvent): void {
    if (event.pointerId !== this._pointerId) return;

    if (!this._locked) {
      this._reset();
      return;
    }

    this._recordSample(event);
    const panEvent = this._createEvent(
      event,
      event.clientX - this._startX,
      event.clientY - this._startY,
    );
    this._releaseCapture(event);
    this._reset();
    this._zone.run(() => this.panEnd.emit(panEvent));
  }

  /**
   * Keeps a locked gesture from being stolen mid-drag. `touch-action` is latched
   * when the gesture starts and still grants the browser the cross axis (`pan-y`
   * for a horizontal pan), so a drag with any perpendicular drift eventually
   * trips the browser's scroll heuristic, which claims the pointer and cancels
   * the gesture. Suppressing the touch default is the only way to decline that
   * hand-off — `preventDefault` on `pointermove` has no effect on scrolling.
   */
  private _onTouchMove(event: TouchEvent): void {
    // Uncancelable once the browser has already committed to scrolling; calling
    // `preventDefault` then only earns a console warning.
    if (this._locked && event.cancelable) event.preventDefault();
  }

  private _onPointerCancel(event: PointerEvent): void {
    if (event.pointerId !== this._pointerId) return;
    this._cancelGesture(event);
  }

  private _cancelGesture(event: PointerEvent): void {
    const wasLocked = this._locked;
    if (wasLocked) this._releaseCapture(event);
    this._reset();
    if (wasLocked) this._zone.run(() => this.panCancel.emit());
  }

  private _reset(): void {
    this._pointerId = null;
    this._locked = false;
    this._lockedAxis = null;
    this._samples = [];
    this._restoreTextSelection();
    this._detachDocumentListeners();
  }

  /**
   * Pointer capture does not stop the browser from sweeping a text selection
   * under a mouse/pen drag, so selection is suspended for the locked gesture
   * by clearing `user-select` on the body and restored on reset.
   */
  private _suppressTextSelection(): void {
    const body = this._elementRef.nativeElement.ownerDocument.body;
    this._previousBodyUserSelect = body.style.userSelect;
    body.style.userSelect = 'none';
  }

  private _restoreTextSelection(): void {
    if (this._previousBodyUserSelect === null) return;

    const body = this._elementRef.nativeElement.ownerDocument.body;
    body.style.userSelect = this._previousBodyUserSelect;
    this._previousBodyUserSelect = null;
  }

  /**
   * The axis the travel so far commits to, or `null` while neither component
   * outweighs the other by `lockRatio`. At the default ratio of 1 the larger
   * component always wins and this never returns `null`.
   */
  private _resolveDominantAxis(deltaX: number, deltaY: number): 'x' | 'y' | null {
    const absoluteX = Math.abs(deltaX);
    const absoluteY = Math.abs(deltaY);
    // Below 1 the two conditions overlap and the x check would win contests it
    // should lose, so sub-1 values are clamped to the neutral ratio.
    const lockRatio = Math.max(1, this.lockRatio());

    if (absoluteX >= absoluteY * lockRatio) return 'x';
    if (absoluteY >= absoluteX * lockRatio) return 'y';
    return null;
  }

  private _releaseCapture(event: PointerEvent): void {
    const host = this._elementRef.nativeElement;
    if (host.hasPointerCapture(event.pointerId)) host.releasePointerCapture(event.pointerId);
  }

  private _isWithinEdge(event: PointerEvent): boolean {
    const edge = this.edge();
    if (edge === null) return true;

    const rect = this._elementRef.nativeElement.getBoundingClientRect();
    const size = this.edgeSize();
    const isRtl = this._directionality.value === 'rtl';

    switch (edge) {
      case 'start':
        return isRtl ? rect.right - event.clientX <= size : event.clientX - rect.left <= size;
      case 'end':
        return isRtl ? event.clientX - rect.left <= size : rect.right - event.clientX <= size;
      case 'top':
        return event.clientY - rect.top <= size;
      case 'bottom':
        return rect.bottom - event.clientY <= size;
    }
  }

  /**
   * Walks from the event target up to and including the host looking for an
   * element that can still scroll in the direction of travel. Such an element
   * keeps the pointer — otherwise swiping a carousel, wide table or chip row
   * would also drive the gesture.
   *
   * The host is part of the walk because it is as much under the pointer as its
   * descendants are: a gesture placed on a scroll container must yield to that
   * container while it still has room, and engage only once it has none.
   */
  private _hasScrollableAncestor(
    event: PointerEvent,
    axis: 'x' | 'y',
    deltaX: number,
    deltaY: number,
  ): boolean {
    const host = this._elementRef.nativeElement;
    let element = event.target instanceof Element ? event.target : null;
    // The walk stops past the host rather than at it, so the host is examined.
    const boundary = host.parentElement;

    while (element !== null && element !== boundary) {
      const canScroll =
        axis === 'x'
          ? this._canScrollHorizontally(element, deltaX)
          : this._canScrollVertically(element, deltaY);
      if (canScroll) return true;
      element = element.parentElement;
    }

    return false;
  }

  private _canScrollHorizontally(element: Element, deltaX: number): boolean {
    const style = getComputedStyle(element);
    if (style.overflowX !== 'auto' && style.overflowX !== 'scroll') return false;

    const maxScroll = element.scrollWidth - element.clientWidth;
    if (maxScroll <= 0) return false;

    // `scrollLeft` runs negative in RTL; the absolute value is the distance
    // scrolled from the inline-start edge in either direction.
    const scrolledFromStart = Math.abs(element.scrollLeft);
    // Resolved from the element's own computed style rather than the app-level
    // direction: a scroll container may set its own `direction`.
    const isRtl = style.direction === 'rtl';
    // Finger travelling toward inline-start reveals content past the current
    // scroll position (scrolls toward inline-end), and vice versa.
    const towardEnd = isRtl ? deltaX > 0 : deltaX < 0;
    return towardEnd ? scrolledFromStart < maxScroll - 1 : scrolledFromStart > 1;
  }

  private _canScrollVertically(element: Element, deltaY: number): boolean {
    const { overflowY } = getComputedStyle(element);
    if (overflowY !== 'auto' && overflowY !== 'scroll') return false;

    const maxScroll = element.scrollHeight - element.clientHeight;
    if (maxScroll <= 0) return false;

    const towardEnd = deltaY < 0;
    return towardEnd ? element.scrollTop < maxScroll - 1 : element.scrollTop > 1;
  }

  private _recordSample(event: PointerEvent): void {
    const cutoff = event.timeStamp - PAN_VELOCITY_WINDOW;
    const samples = this._samples;

    // Pruned in place: this runs on every pointermove, so no fresh array per
    // sample. The window holds only a handful of entries, so `shift` is cheap.
    while (samples.length > 0 && samples[0].timeStamp < cutoff) samples.shift();
    samples.push({ x: event.clientX, y: event.clientY, timeStamp: event.timeStamp });
  }

  private _velocity(): { velocityX: number; velocityY: number } {
    const samples = this._samples;
    if (samples.length < 2) return { velocityX: 0, velocityY: 0 };

    const first = samples[0];
    const last = samples[samples.length - 1];
    const elapsed = last.timeStamp - first.timeStamp;
    if (elapsed <= 0) return { velocityX: 0, velocityY: 0 };

    return {
      velocityX: (last.x - first.x) / elapsed,
      velocityY: (last.y - first.y) / elapsed,
    };
  }

  private _resolveDirection(deltaX: number, deltaY: number): panDirection {
    const axis = this._lockedAxis ?? (Math.abs(deltaX) >= Math.abs(deltaY) ? 'x' : 'y');
    if (axis === 'x') return deltaX < 0 ? 'left' : 'right';
    return deltaY < 0 ? 'up' : 'down';
  }

  private _toLogicalDirection(direction: panDirection): panDirection {
    if (this._directionality.value !== 'rtl') return direction;
    if (direction === 'left') return 'right';
    if (direction === 'right') return 'left';
    return direction;
  }

  private _createEvent(event: PointerEvent, deltaX: number, deltaY: number): PanEvent {
    const { velocityX, velocityY } = this._velocity();
    const direction = this._resolveDirection(deltaX, deltaY);

    return {
      deltaX,
      deltaY,
      distance: Math.hypot(deltaX, deltaY),
      velocityX,
      velocityY,
      direction,
      logicalDirection: this._toLogicalDirection(direction),
      pointerType: event.pointerType,
      originalEvent: event,
    };
  }
}
