import {
  booleanAttribute,
  computed,
  DestroyRef,
  Directive,
  effect,
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
  PULL_TO_REFRESH_DEFAULT_MAX_DISTANCE,
  PULL_TO_REFRESH_DEFAULT_MIN_REFRESHING_TIME,
  PULL_TO_REFRESH_DEFAULT_THRESHOLD,
  PULL_TO_REFRESH_RESISTANCE,
} from './pull-to-refresh.constants';
import { pullToRefreshState } from './pull-to-refresh.types';

/**
 * Pull-to-refresh on a scroll container.
 *
 * Belongs on the scrolling element itself. A downward drag anywhere in it is left
 * to the browser for as long as the container has somewhere to scroll to; only
 * once it sits at the top does the drag become a pull, so the gesture never
 * competes with reading what is in the container.
 *
 * Headless: it reports the pull and renders nothing. The travel is published as
 * `--tls-pull-distance` on the host and the stage as a `tls-pull-to-refresh--*`
 * class, so an indicator can be placed and styled entirely in CSS. The travel is
 * written straight to the host's style outside the Angular zone, so following a
 * finger costs no change detection.
 *
 * The host's block overscroll is disabled entirely while the gesture is enabled:
 * a browser already at the top otherwise spends the drag on its own overscroll —
 * chaining to what is behind the container, or the local stretch/bounce effect —
 * and claims the pointer for it, cancelling the pan before it can become a pull.
 */
@Directive({
  selector: '[tlsPullToRefresh]',
  // The pan's own enable input is aliased to this directive's, so one binding
  // governs both: a disabled pull must not leave a gesture underneath still
  // capturing the pointer.
  hostDirectives: [{ directive: PanDirective, inputs: ['tlsPan: tlsPullToRefresh'] }],
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
    // Only the always-on classes live here; the stage class is written by the
    // directive itself (see `_setState`) so it lands in the same frame as the
    // travel it accompanies.
    class: 'tls-pull-to-refresh tls-pull-to-refresh--idle',
    '[style.overscroll-behavior-block]': "tlsPullToRefresh() ? 'none' : null",
  },
})
export class PullToRefreshDirective {
  // Injections
  private readonly _elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly _renderer = inject(Renderer2);

  // Inputs
  /** Enables the gesture. Bind `[tlsPullToRefresh]="false"` to disable; the bare attribute enables. */
  public readonly tlsPullToRefresh: InputSignalWithTransform<boolean, unknown> = input(true, {
    transform: booleanAttribute,
  });
  /** How far in px the pull must reach before releasing it asks for a refresh. */
  public readonly threshold: InputSignal<number> = input<number>(
    PULL_TO_REFRESH_DEFAULT_THRESHOLD,
  );
  /** Furthest in px the pull travels, however far the finger goes. */
  public readonly maxDistance: InputSignal<number> = input<number>(
    PULL_TO_REFRESH_DEFAULT_MAX_DISTANCE,
  );
  /**
   * Whether the refresh asked for here is still running. Holding it `true` keeps
   * the pull open; clearing it lets the surface return.
   */
  public readonly refreshing: InputSignalWithTransform<boolean, unknown> = input(false, {
    transform: booleanAttribute,
  });
  /**
   * Shortest time in ms the surface is held open once a refresh is asked for,
   * however quickly `refreshing` clears — so a refresh answered instantly still
   * reads as one having happened.
   */
  public readonly minRefreshingTime: InputSignal<number> = input<number>(
    PULL_TO_REFRESH_DEFAULT_MIN_REFRESHING_TIME,
  );

  // Outputs
  /** Emits once when a pull is released past the threshold. */
  public readonly refresh = output<void>();

  // State
  private readonly _state = signal<pullToRefreshState>('idle');
  // When the refreshing stage was entered, for measuring the minimum hold.
  private _refreshingSince = 0;
  // Pending deferred settle, waiting out the remainder of the minimum hold.
  private _settleTimeout: ReturnType<typeof setTimeout> | null = null;
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
      pan.panCancel.subscribe(() => this._settle()),
    ];

    inject(DestroyRef).onDestroy(() => {
      for (const subscription of subscriptions) subscription.unsubscribe();
      this._clearSettleTimeout();
    });

    // The pull is held open while something reports the refresh as running, and
    // never shorter than the minimum hold. Both the report and the stage are
    // dependencies: releasing a pull is what opens it, so a consumer that tracks
    // nothing must still get it back — and settling changes the stage again,
    // which re-runs and stops here.
    effect(() => {
      if (this.refreshing() || this._state() !== 'refreshing') return;

      const remaining = this._refreshingSince + this.minRefreshingTime() - Date.now();
      if (remaining <= 0) {
        this._settle();
        return;
      }

      // The callback re-checks what this effect checked: the report may have
      // turned back on while the hold ran out.
      this._clearSettleTimeout();
      this._settleTimeout = setTimeout(() => {
        this._settleTimeout = null;
        if (this.refreshing() || this._state() !== 'refreshing') return;
        this._settle();
      }, remaining);
    });
  }

  // Private methods
  private _onPanStart(event: PanEvent): void {
    if (!this.tlsPullToRefresh() || this._state() === 'refreshing') return;
    // Only a downward drag is a pull; upward is the container being read.
    if (event.deltaY <= 0) return;

    this._setState('pulling');
    this._write(this._resolveDistance(event.deltaY));
  }

  /**
   * Runs outside the Angular zone (see `PanDirective.panMove`), so it writes the
   * travel to the host's style directly and moves the stage only when it changes
   * rather than on every frame of the drag.
   */
  private _onPanMove(event: PanEvent): void {
    const state = this._state();
    if (state !== 'pulling' && state !== 'armed') return;

    const distance = this._resolveDistance(event.deltaY);
    this._write(distance);

    this._setState(distance >= this._armingDistance() ? 'armed' : 'pulling');
  }

  private _onPanEnd(): void {
    const state = this._state();
    // A gesture that never became a pull has nothing to put back.
    if (state === 'idle') return;

    if (state !== 'armed') {
      this._settle();
      return;
    }

    // Held at the threshold rather than wherever the finger let go, so every
    // refresh reads the same however hard it was pulled. The stage moves before
    // the travel: the refreshing stage is what re-enables a consumer's return
    // transition, so it must be in force when the travel snaps back.
    this._refreshingSince = Date.now();
    this._setState('refreshing');
    this._write(this._armingDistance());
    this.refresh.emit();
  }

  private _settle(): void {
    this._clearSettleTimeout();
    this._setState('idle');
    this._write(0);
  }

  private _clearSettleTimeout(): void {
    if (this._settleTimeout === null) return;

    clearTimeout(this._settleTimeout);
    this._settleTimeout = null;
  }

  private _setState(state: pullToRefreshState): void {
    const previous = this._state();
    if (previous === state) return;

    this._state.set(state);
    const element = this._elementRef.nativeElement;
    this._renderer.removeClass(element, `tls-pull-to-refresh--${previous}`);
    this._renderer.addClass(element, `tls-pull-to-refresh--${state}`);
  }

  /**
   * The travel a drag amounts to: a share of it, capped — so the surface lags the
   * finger and then holds while the finger carries on.
   */
  private _resolveDistance(deltaY: number): number {
    const pulled = Math.max(0, deltaY) * PULL_TO_REFRESH_RESISTANCE;
    return Math.min(pulled, this.maxDistance());
  }

  private _write(distance: number): void {
    // A pull held at the cap resolves to the same travel on every following
    // move; re-writing it would invalidate style once per frame for nothing.
    if (distance === this._writtenDistance) return;
    this._writtenDistance = distance;

    this._renderer.setStyle(
      this._elementRef.nativeElement,
      '--tls-pull-distance',
      `${distance}px`,
      // A custom property only lands when it is set as one; without the flag the
      // renderer treats the name as a camelCase style property.
      RendererStyleFlags2.DashCase,
    );
  }
}
