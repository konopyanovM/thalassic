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
  output,
  Renderer2,
  RendererStyleFlags2,
  signal,
  Signal,
} from '@angular/core';
import { DEFAULT_PAN_CONFIG, PAN_CONFIG, PanDirective, PanEvent } from '../pan';
import {
  EDGE_PULL_DEFAULT_MAX_DISTANCE,
  EDGE_PULL_DEFAULT_REVERSE_DEAD_ZONE,
  EDGE_PULL_DEFAULT_THRESHOLD,
  EDGE_PULL_RESISTANCE,
} from './edge-pull.constants';
import { edgePullEdge, edgePullState } from './edge-pull.types';

/**
 * Pulling past either end of a scroll container, for moving on to whatever
 * stands before or after what the container holds.
 *
 * Belongs on the scrolling element itself. A vertical drag anywhere in it is
 * left to the browser for as long as the container has somewhere to scroll to
 * that way; only once it sits at that end does the drag become a pull, so the
 * gesture never competes with reading what is in the container. A container
 * with nothing to scroll sits at both ends at once.
 *
 * A pull keeps to the end it began at, so carrying it back past where it began
 * only cancels it. With `reversible` it changes ends there instead, for a host
 * where one drag should be able to reach either neighbour.
 *
 * Headless: it reports the pull and renders nothing. The travel is published as
 * `--tls-edge-pull-distance` on the host, the stage as a `tls-edge-pull--*`
 * class and the end being pulled as `tls-edge-pull--start` / `--end`, so an
 * indicator can be placed and styled entirely in CSS. The travel is written
 * straight to the host's style outside the Angular zone, so following a finger
 * costs no change detection.
 *
 * A committed pull springs back as it is reported, unless `holdOnCommit` keeps
 * it where it was released until `settle()` is called — so whatever the pull
 * led to can take its place from exactly where it stood, a view transition
 * capturing it mid-pull among them.
 *
 * The host's block overscroll is disabled entirely while the gesture is enabled:
 * a browser already at an end otherwise spends the drag on its own overscroll —
 * chaining to what is behind the container, or the local stretch/bounce effect —
 * and claims the pointer for it, cancelling the pan before it can become a pull.
 */
@Directive({
  selector: '[tlsEdgePull]',
  // The pan's own enable input is aliased to this directive's, so one binding
  // governs both: a disabled pull must not leave a gesture underneath still
  // capturing the pointer.
  hostDirectives: [{ directive: PanDirective, inputs: ['tlsPan: tlsEdgePull'] }],
  // The gesture shares the vertical axis with the container's own scrolling, so
  // it must not claim it, and only a finger can pull.
  providers: [
    {
      provide: PAN_CONFIG,
      useValue: {
        ...DEFAULT_PAN_CONFIG,
        axis: 'y',
        manageTouchAction: false,
        pointerTypes: ['touch'],
      },
    },
  ],
  host: {
    // Only the always-on classes live here; the stage and edge classes are
    // written by the directive itself (see `_setState`) so they land in the same
    // frame as the travel they accompany.
    class: 'tls-edge-pull tls-edge-pull--idle',
    '[style.overscroll-behavior-block]': "tlsEdgePull() ? 'none' : null",
    '(pointerdown)': 'onPointerDown($event)',
  },
})
export class EdgePullDirective {
  // Injections
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _renderer = inject(Renderer2);

  // Inputs
  /** Enables the gesture. Bind `[tlsEdgePull]="false"` to disable; the bare attribute enables. */
  public readonly tlsEdgePull: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });
  /** Whether there is anything to pull to past the top; without it a drag down is no pull. */
  public readonly start: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });
  /** Whether there is anything to pull to past the bottom; without it a drag up is no pull. */
  public readonly end: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });
  /** How far in px the pull must reach before releasing it commits. */
  public readonly threshold: InputSignal<number> = input<number>(EDGE_PULL_DEFAULT_THRESHOLD);
  /** Furthest in px the pull travels, however far the finger goes. */
  public readonly maxDistance: InputSignal<number> = input<number>(
    EDGE_PULL_DEFAULT_MAX_DISTANCE,
  );
  /**
   * Whether a drag carried back past where it began turns into a pull on the
   * other end, provided there is something past that end and the container sits
   * at it. Off, a pull keeps to the end it began at and going back only cancels.
   */
  public readonly reversible: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });
  /**
   * How far in px past where the gesture began the finger has to go before a
   * reversible pull changes ends. Within it neither end is pulled, so a finger
   * wavering about its starting point does not flicker between the two.
   */
  public readonly reverseDeadZone: InputSignal<number> = input<number>(
    EDGE_PULL_DEFAULT_REVERSE_DEAD_ZONE,
  );
  /**
   * Selector of what inside the container is not to be pulled by: a drag that
   * starts on a match is somebody else's — a handle being dragged, a control
   * with a vertical gesture of its own. It is judged by where the finger comes
   * down. By the time a drag has travelled far enough to become a pull, whatever
   * owns that element may well have acted on it first — lifted it, replaced it
   * with a placeholder — and the finger is no longer over what it touched.
   */
  public readonly ignore: InputSignal<string | null> = input<string | null>(null);
  /**
   * Keeps a committed pull where it was released — its travel, stage and end —
   * instead of springing it back, until `settle()` is called. No new pull can
   * begin in the meantime, so a host that holds must always settle.
   */
  public readonly holdOnCommit: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });

  // Outputs
  /** Emits the end pulled away from, once, when a pull is released past the threshold. */
  public readonly pulled = output<edgePullEdge>();

  // State
  private readonly _state = signal<edgePullState>('idle');
  // The end the pull under way is leaving by; `null` while nothing is pulled.
  private _edge: edgePullEdge | null = null;
  // Whether the finger of the gesture under way came down on something ignored.
  private _startedOnIgnored = false;
  // Whether the gesture under way may pull at all: it began while enabled, off
  // anything ignored. A reversible gesture can be one without pulling yet, when
  // it set off towards an end with nothing past it.
  private _tracking = false;
  // Whether the gesture under way has changed ends. From then on travel is
  // measured from the dead zone's rim rather than from where the gesture began,
  // so a pull picks up from nothing on either side of it.
  private _reversed = false;
  // Whether a committed pull is being held for `settle()`.
  private _held = false;
  // Travel last written to the host, for skipping no-op writes; `null` until the
  // first write.
  private _writtenDistance: number | null = null;

  // Computed
  /**
   * The travel a pull has to reach to arm, which can never exceed how far it is
   * allowed to travel — a threshold past the cap would make the gesture
   * unarmable, so the cap wins.
   */
  private readonly _armingDistance: Signal<number> = computed(() =>
    Math.min(this.threshold(), this.maxDistance()),
  );

  constructor() {
    const pan = inject(PanDirective);
    // Subscribed rather than bound through host listeners so `panMove` keeps its
    // place outside the Angular zone, which is the point of it.
    const subscriptions = [
      pan.panStart.subscribe(event => this._onPanStart(event)),
      pan.panMove.subscribe(event => this._onPanMove(event)),
      pan.panEnd.subscribe(() => this._onPanEnd()),
      pan.panCancel.subscribe(() => this._onPanCancel()),
    ];

    inject(DestroyRef).onDestroy(() => {
      for (const subscription of subscriptions) subscription.unsubscribe();
    });
  }

  // Public methods
  /**
   * Springs the pull back to rest: a committed pull held by `holdOnCommit`, or
   * one still under way, which is cancelled without being reported.
   */
  public settle(): void {
    this._held = false;
    this._tracking = false;
    this._leaveEdge();
    this._setState('idle');
    this._write(0);
  }

  // Protected methods
  protected onPointerDown(event: PointerEvent): void {
    const ignore = this.ignore();
    const target = event.target;

    this._startedOnIgnored =
      ignore !== null && target instanceof Element && target.closest(ignore) !== null;
  }

  // Private methods
  private _onPanStart(event: PanEvent): void {
    if (!this.tlsEdgePull() || event.deltaY === 0) return;
    if (this._startedOnIgnored || this._held) return;

    this._tracking = true;
    this._reversed = false;

    // The pan only locks where the container has no room left the way the drag
    // set off, so the end it heads for needs no checking here.
    const edge = this._edgeFor(event.deltaY);
    if (!this._isOffered(edge)) return;

    this._begin(edge);
    this._write(this._resolveDistance(event.deltaY));
  }

  /**
   * Runs outside the Angular zone (see `PanDirective.panMove`), so it writes the
   * travel to the host's style directly and moves the stage only when it changes
   * rather than on every frame of the drag.
   */
  private _onPanMove(event: PanEvent): void {
    if (!this._tracking) return;
    if (this.reversible()) this._reverseIfCrossed(event.deltaY);
    if (this._state() === 'idle') return;

    const distance = this._resolveDistance(event.deltaY);
    this._write(distance);

    this._setState(distance >= this._armingDistance() ? 'armed' : 'pulling');
  }

  private _onPanEnd(): void {
    // A gesture made while a pull is held never became a pull of its own.
    if (this._held) return;

    const state = this._state();
    const edge = this._edge;
    this._tracking = false;
    // A gesture that never became a pull has nothing to put back.
    if (state === 'idle' || edge === null) return;

    if (state === 'armed' && this.holdOnCommit()) {
      this._held = true;
    } else {
      this.settle();
    }
    if (state === 'armed') this.pulled.emit(edge);
  }

  // A cancelled gesture puts back a pull of its own, never one being held.
  private _onPanCancel(): void {
    if (this._held) return;
    this.settle();
  }

  /**
   * Changes the end being pulled once the finger has gone back past where the
   * gesture began and out the far side of the dead zone. The other end has to
   * be one there is something past, and one the container sits at: the pan that
   * carries the gesture has the pointer by now, so nothing would scroll the
   * container to that end first.
   */
  private _reverseIfCrossed(deltaY: number): void {
    if (Math.abs(deltaY) <= this.reverseDeadZone()) return;

    const edge = this._edgeFor(deltaY);
    if (edge === this._edge) return;
    if (!this._isOffered(edge) || !this._sitsAt(edge)) return;

    this._leaveEdge();
    this._reversed = true;
    this._begin(edge);
  }

  private _begin(edge: edgePullEdge): void {
    this._edge = edge;
    this._renderer.addClass(this._elementRef.nativeElement, `tls-edge-pull--${edge}`);
    this._setState('pulling');
  }

  private _leaveEdge(): void {
    if (this._edge === null) return;

    this._renderer.removeClass(this._elementRef.nativeElement, `tls-edge-pull--${this._edge}`);
    this._edge = null;
  }

  // A drag down leaves by the top, a drag up by the bottom.
  private _edgeFor(deltaY: number): edgePullEdge {
    return deltaY > 0 ? 'start' : 'end';
  }

  private _isOffered(edge: edgePullEdge): boolean {
    return edge === 'start' ? this.start() : this.end();
  }

  // A pixel of slack either way: scroll offsets are fractional on scaled displays.
  private _sitsAt(edge: edgePullEdge): boolean {
    const element = this._elementRef.nativeElement;
    if (edge === 'start') return element.scrollTop <= 1;

    return element.scrollTop >= element.scrollHeight - element.clientHeight - 1;
  }

  private _setState(state: edgePullState): void {
    const previous = this._state();
    if (previous === state) return;

    this._state.set(state);
    const element = this._elementRef.nativeElement;
    this._renderer.removeClass(element, `tls-edge-pull--${previous}`);
    this._renderer.addClass(element, `tls-edge-pull--${state}`);
  }

  /**
   * The travel a drag amounts to, measured away from the end being left: a share
   * of it, capped — so the surface lags the finger and then holds while the
   * finger carries on. A drag that turns back past where it began is no travel.
   * Once the gesture has changed ends the measure starts at the dead zone's rim,
   * where the change happens, so the new pull grows from nothing.
   */
  private _resolveDistance(deltaY: number): number {
    const away = this._edge === 'end' ? -deltaY : deltaY;
    const origin = this._reversed ? this.reverseDeadZone() : 0;
    const pulled = Math.max(0, away - origin) * EDGE_PULL_RESISTANCE;
    return Math.min(pulled, this.maxDistance());
  }

  private _write(distance: number): void {
    // A pull held at the cap resolves to the same travel on every following
    // move; re-writing it would invalidate style once per frame for nothing.
    if (distance === this._writtenDistance) return;
    this._writtenDistance = distance;

    this._renderer.setStyle(
      this._elementRef.nativeElement,
      '--tls-edge-pull-distance',
      `${distance}px`,
      // A custom property only lands when it is set as one; without the flag the
      // renderer treats the name as a camelCase style property.
      RendererStyleFlags2.DashCase,
    );
  }
}
