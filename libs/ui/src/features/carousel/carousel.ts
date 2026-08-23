import { Directionality } from '@angular/cdk/bidi';
import { isPlatformBrowser, NgTemplateOutlet } from '@angular/common';
import {
  afterNextRender,
  booleanAttribute,
  Component,
  computed,
  contentChildren,
  DestroyRef,
  effect,
  ElementRef,
  inject,
  Injector,
  input,
  InputSignal,
  InputSignalWithTransform,
  isDevMode,
  model,
  ModelSignal,
  PLATFORM_ID,
  Signal,
  signal,
  viewChild,
  WritableSignal,
} from '@angular/core';
import { MotionService, PanDirective, PanEvent } from '@thalassic/core';
import { Button } from '../button';
import { Icon } from '../icon';
import { CarouselSlide } from './carousel-slide';
import { CarouselConfig, CarouselLabels } from './carousel.config';
import {
  CAROUSEL_CLICK_SUPPRESSION_WINDOW,
  CAROUSEL_DRAG_LOCK_RATIO,
  CAROUSEL_DRAG_START_SLOP,
  CAROUSEL_EDGE_DRAG_RESISTANCE,
  CAROUSEL_FLICK_VELOCITY,
  CAROUSEL_SWIPE_THRESHOLD_RATIO,
} from './carousel.constants';
import { CAROUSEL_CONFIG } from './carousel.token';

/**
 * A horizontally sliding carousel implementing the WAI-ARIA carousel pattern:
 * each slide is a `role="group"`/`aria-roledescription="slide"` region, hidden
 * slides are inert, and auto-rotation — when enabled — pauses on hover and
 * while the page is hidden, stops when keyboard focus enters, and only runs at
 * the `full` motion level, with a rotation toggle placed first in the tab order.
 *
 * Slides can also be dragged or flicked sideways. The gesture waits out a slop,
 * claims only the horizontal axis and yields to any scrollable ancestor, so
 * vertical scrolling over a slide stays native (see {@link PanDirective}); it
 * is a shortcut rather than the only path, since the arrows and indicators
 * reach every slide by keyboard.
 */
@Component({
  selector: 'tls-carousel',
  imports: [Button, Icon, NgTemplateOutlet, PanDirective],
  templateUrl: './carousel.html',
  host: {
    role: 'group',
    'aria-roledescription': 'carousel',
    '[class]': 'hostClasses()',
    '[style.--tls-carousel-selected]': 'selected()',
    '[attr.aria-label]': 'ariaLabel() ?? null',
    '[attr.aria-labelledby]': 'ariaLabelledby() ?? null',
    '(pointerenter)': 'onPointerEnter()',
    '(pointerleave)': 'onPointerLeave()',
    '(pointerdown)': 'onPointerDown()',
    '(focusin)': 'onFocusIn()',
  },
})
export class Carousel {
  // Injections
  private readonly _config: CarouselConfig = inject(CAROUSEL_CONFIG);
  private readonly _directionality = inject(Directionality);
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _injector = inject(Injector);
  private readonly _destroyRef = inject(DestroyRef);
  // Optional: apps without `provideMotion()` get no motion gating and rotation stays allowed.
  private readonly _motion = inject(MotionService, { optional: true });
  private readonly _isBrowser: boolean = isPlatformBrowser(inject(PLATFORM_ID));

  // Inputs
  public readonly loop: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.loop,
    { transform: booleanAttribute },
  );
  public readonly autoplayInterval: InputSignal<number> = input<number>(
    this._config.autoplayInterval,
  );
  public readonly showArrows: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.showArrows,
    { transform: booleanAttribute },
  );
  public readonly showIndicators: InputSignalWithTransform<boolean, unknown> = input<
    boolean,
    unknown
  >(this._config.showIndicators, { transform: booleanAttribute });

  /** Zero-based index of the selected slide. Two-way bound; interaction updates it. */
  public readonly selected: ModelSignal<number> = model<number>(0);

  /** Accessible name for the carousel container. */
  public readonly ariaLabel: InputSignal<string | undefined> = input<string | undefined>(undefined);
  public readonly ariaLabelledby: InputSignal<string | undefined> = input<string | undefined>(
    undefined,
  );

  // State
  protected readonly slides: Signal<readonly CarouselSlide[]> = contentChildren(CarouselSlide);
  protected readonly labels: CarouselLabels = this._config.labels;

  // Gesture shape, bound explicitly on the viewport: `PAN_CONFIG` resolves
  // through the element injector, so an ancestor gesture that provides it for
  // itself would otherwise reconfigure this one.
  protected readonly dragSlop: number = CAROUSEL_DRAG_START_SLOP;
  protected readonly dragLockRatio: number = CAROUSEL_DRAG_LOCK_RATIO;

  /** User intent for auto-rotation, toggled by the rotation control. */
  protected readonly playing: WritableSignal<boolean> = signal(true);

  private readonly _viewport: Signal<ElementRef<HTMLElement>> =
    viewChild.required<ElementRef<HTMLElement>>('viewport');

  private readonly _dragging: WritableSignal<boolean> = signal(false);
  private readonly _hovered: WritableSignal<boolean> = signal(false);
  // A hidden page paints nothing, so rotation there only burns the slides the
  // user came back to see.
  private readonly _pageVisible: WritableSignal<boolean> = signal(true);
  /** Suppresses the slide transition for a change that would otherwise travel the whole track. */
  private readonly _instant: WritableSignal<boolean> = signal(false);

  // Drag bookkeeping between gesture events; not reactive.
  // Travel already spent crossing the slop when the gesture locked. Deltas are
  // rebased against it so the track follows the finger from where it locked
  // instead of jumping by the slop on the first move.
  private _lockDelta = 0;
  private _dragEndedAt = Number.NEGATIVE_INFINITY;
  // Whether focus currently entering the carousel was driven by a pointer.
  private _pointerFocus = false;

  // Pre-bound so attaching and detaching always reference the same function.
  private readonly _endPointerFocus = (): void => {
    this._pointerFocus = false;

    const documentReference = this._elementRef.nativeElement.ownerDocument;
    documentReference.removeEventListener('pointerup', this._endPointerFocus, true);
    documentReference.removeEventListener('pointercancel', this._endPointerFocus, true);
  };

  // Computed
  protected readonly count = computed(() => this.slides().length);

  protected readonly canPrevious = computed(() =>
    this.loop() ? this.count() > 1 : this.selected() > 0,
  );
  protected readonly canNext = computed(() =>
    this.loop() ? this.count() > 1 : this.selected() < this.count() - 1,
  );

  protected readonly autoplayEnabled = computed(
    () => this.autoplayInterval() > 0 && this.count() > 1,
  );

  /**
   * The slides container is a polite live region only while it changes by user
   * action; announcing every automatic advance would be constant chatter.
   */
  protected readonly liveMode = computed(() => (this._rotating() ? 'off' : 'polite'));

  protected readonly hostClasses = computed(() => {
    const className = 'tls-carousel';

    const array: string[] = [className];

    if (this._dragging()) array.push(`${className}--dragging`);
    if (this._instant()) array.push(`${className}--instant`);

    return array;
  });

  // Auto-advancing content is motion the user has not asked for, so rotation
  // requires the expressive (`full`) motion level, pauses while hovered or
  // while the page is hidden, and stays off after the user stops it.
  private readonly _rotating = computed(() => {
    if (!this.autoplayEnabled()) return false;
    if (!this.playing() || this._hovered() || !this._pageVisible()) return false;
    if (!this._motion) return true;
    return this._motion.currentMotionLevel() === 'full';
  });

  // Constructor
  constructor() {
    // Normalize an out-of-range index — a shrinking slide list, or an external
    // set beyond the last slide — back into range. While no slides have been
    // projected yet the range is unknown, so the index is left alone.
    effect(() => {
      if (this.count() < 1) return;

      const clamped = this._clamp(this.selected());
      if (clamped !== this.selected()) this.selected.set(clamped);
    });

    effect(onCleanup => {
      if (!this._isBrowser || !this._rotating()) return;

      // Reading the selection restarts the timer whenever the slide changes, so
      // a slide reached by hand still gets a full interval on screen rather
      // than whatever was left of the running one.
      this.selected();

      const timer = setInterval(() => this._advance(1, true), this.autoplayInterval());
      onCleanup(() => clearInterval(timer));
    });

    if (isDevMode()) {
      effect(() => {
        if (Boolean(this.ariaLabel()) || Boolean(this.ariaLabelledby())) return;

        console.warn(
          '[tls-carousel] No `ariaLabel` or `ariaLabelledby` set. A carousel is announced as a ' +
            'landmark-like region and needs a name to be distinguishable from the rest of the page.',
        );
      });
    }

    if (this._isBrowser) {
      this._watchPageVisibility();
      this._suppressPostDragClicks();
    }
  }

  // Protected methods
  protected previous(): void {
    if (!this.canPrevious()) return;

    this._advance(-1, this.loop());
  }

  protected next(): void {
    if (!this.canNext()) return;

    this._advance(1, this.loop());
  }

  protected goTo(index: number): void {
    this.selected.set(this._clamp(index));
  }

  protected toggleRotation(): void {
    this.playing.update(playing => !playing);
  }

  protected onPointerEnter(): void {
    this._hovered.set(true);
  }

  protected onPointerLeave(): void {
    this._hovered.set(false);
  }

  /**
   * Marks focus that lands during a press as pointer-driven. The press may end
   * anywhere — outside the carousel, or in another window — so the release is
   * watched on the document; a flag left standing would make the next keyboard
   * focus look like a click.
   */
  protected onPointerDown(): void {
    if (!this._isBrowser) return;

    this._pointerFocus = true;

    const documentReference = this._elementRef.nativeElement.ownerDocument;
    documentReference.addEventListener('pointerup', this._endPointerFocus, true);
    documentReference.addEventListener('pointercancel', this._endPointerFocus, true);
  }

  /**
   * Keyboard focus entering the carousel stops rotation for good (it only
   * restarts through the rotation control), so the user can read and operate
   * the content without it moving away. Pointer-driven focus does not: a click
   * on the rotation control would otherwise stop rotation on the way in and
   * have its own toggle start it straight back up.
   */
  protected onFocusIn(): void {
    if (this._pointerFocus) return;

    this.playing.set(false);
  }

  /**
   * Images and links start a native content drag on a mouse press, and the
   * browser cancels the pointer to run it — taking the swipe with it. A track
   * that moves sideways under the pointer cannot also hand its content to a
   * drag-and-drop, so the native one gives way.
   */
  protected onDragStart(event: DragEvent): void {
    if (this.count() < 2) return;

    event.preventDefault();
  }

  protected onPanStart(event: PanEvent): void {
    this._lockDelta = event.deltaX;
    this._dragging.set(true);
  }

  /**
   * Fired at pointer rate (see {@link PanDirective}), so the offset is written
   * straight to the DOM rather than through a binding and no change detection
   * runs per move.
   */
  protected onPanMove(event: PanEvent): void {
    this._applyDragOffset(this._resistedOffset(event.deltaX - this._lockDelta));
  }

  protected onPanEnd(event: PanEvent): void {
    const offset = this._resistedOffset(event.deltaX - this._lockDelta);
    // Forward travel heads toward the next slide; the physical direction flips in RTL.
    const factor = this._isRtl() ? 1 : -1;
    const travelled = offset * factor;
    const velocity = event.velocityX * factor;
    const step = travelled >= 0 ? 1 : -1;

    const width = this._viewport().nativeElement.getBoundingClientRect().width;
    const dragged = width > 0 && Math.abs(travelled) >= width * CAROUSEL_SWIPE_THRESHOLD_RATIO;
    const flicked = velocity * step >= CAROUSEL_FLICK_VELOCITY;

    this._settleDrag();

    if (dragged || flicked) this._advance(step, this.loop());
  }

  protected onPanCancel(): void {
    this._settleDrag();
  }

  // Private methods
  private _isRtl(): boolean {
    return this._directionality.value === 'rtl';
  }

  private _clamp(index: number): number {
    return Math.min(Math.max(0, index), Math.max(0, this.count() - 1));
  }

  private _advance(step: number, wrap: boolean): void {
    const count = this.count();
    if (count < 1) return;

    const target = this.selected() + step;

    if (target >= 0 && target < count) {
      this.selected.set(target);
      return;
    }

    if (!wrap) return;

    // Wrapping crosses the whole track, and sliding through every slide on the
    // way reads as a glitch rather than as movement between neighbours, so the
    // wrap is a cut.
    this._jumpTo((target + count) % count);
  }

  /** Moves to a slide with the track transition suppressed for that one change. */
  private _jumpTo(index: number): void {
    if (!this._isBrowser) {
      this.selected.set(index);
      return;
    }

    this._instant.set(true);
    this.selected.set(index);
    // The class and the new position land in the same render pass, so the cut
    // is never animated. Restoring transitions has to wait for the frame that
    // paints it — undone any earlier, the browser would still see a changed
    // transform with transitions on and animate the cut after all.
    requestAnimationFrame(() => requestAnimationFrame(() => this._instant.set(false)));
  }

  /**
   * Damps travel toward an edge with no slide behind it, so a drag at the first
   * or last slide resists instead of pulling empty track into view.
   */
  private _resistedOffset(offset: number): number {
    const forward = this._isRtl() ? offset > 0 : offset < 0;
    const blocked = forward ? !this.canNext() : !this.canPrevious();

    return blocked ? offset / CAROUSEL_EDGE_DRAG_RESISTANCE : offset;
  }

  private _applyDragOffset(offset: number): void {
    this._elementRef.nativeElement.style.setProperty('--tls-carousel-drag', `${offset}px`);
  }

  private _settleDrag(): void {
    this._dragging.set(false);
    this._dragEndedAt = performance.now();

    // The dragging class — and any new selection — only reach the DOM with the
    // next render pass. Clearing the offset before then would snap the track
    // back with transitions still suppressed; clearing it in that same pass
    // leaves one style change, so the track travels to its resting place in a
    // single transition.
    afterNextRender(() => this._clearDragOffset(), { injector: this._injector });
  }

  private _clearDragOffset(): void {
    this._elementRef.nativeElement.style.removeProperty('--tls-carousel-drag');
  }

  /**
   * Swallows the click that concludes a drag so the slide content under the
   * released pointer is not activated. The listener runs in the capture phase:
   * the click has to be stopped before it reaches that content, and a
   * bubble-phase listener would only see it once the content had handled it.
   */
  private _suppressPostDragClicks(): void {
    const host = this._elementRef.nativeElement;
    const onClick = (event: Event): void => {
      if (performance.now() - this._dragEndedAt >= CAROUSEL_CLICK_SUPPRESSION_WINDOW) return;

      this._dragEndedAt = Number.NEGATIVE_INFINITY;
      event.preventDefault();
      event.stopPropagation();
    };

    host.addEventListener('click', onClick, true);
    this._destroyRef.onDestroy(() => host.removeEventListener('click', onClick, true));
  }

  private _watchPageVisibility(): void {
    const documentReference = this._elementRef.nativeElement.ownerDocument;
    const onVisibilityChange = (): void =>
      this._pageVisible.set(documentReference.visibilityState === 'visible');

    onVisibilityChange();
    documentReference.addEventListener('visibilitychange', onVisibilityChange);
    this._destroyRef.onDestroy(() =>
      documentReference.removeEventListener('visibilitychange', onVisibilityChange),
    );
  }
}
