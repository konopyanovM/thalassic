import { Directionality } from '@angular/cdk/bidi';
import { CdkDialogContainer, DialogRef } from '@angular/cdk/dialog';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import {
  afterNextRender,
  Component,
  DestroyRef,
  computed,
  inject,
  Injector,
  Renderer2,
  RendererStyleFlags2,
  signal,
} from '@angular/core';
import {
  DRAG_DISMISS_RATIO,
  MOTION_ATTRIBUTE,
  PanDirective,
  PanEvent,
  SWIPE_DEFAULT_MIN_VELOCITY,
} from '@thalassic/core';
import {
  afterLeaveAnimation,
  settleAfterRender,
  whenAnimationsFinish,
} from '../../abstract/overlay';
import { Icon } from '../icon';
import { DrawerPanelConfig } from './drawer.config';
import { DRAWER_NAMED_SIZES } from './drawer.constants';
import { DrawerOpenGesture } from './drawer-open-gesture';
import {
  measureOriginOffset,
  measureSharedPairs,
  offscreenOffset,
  readSlideTiming,
  slideFromOrigin,
  slideToOrigin,
} from './drawer-origin-slide';
import { DRAWER_OPENING, DRAWER_PANEL_CONFIG } from './drawer.token';
import {
  drawerDragState,
  DrawerOffset,
  drawerOpenPhase,
  drawerSize,
  DrawerSlideTiming,
} from './drawer.types';

@Component({
  selector: 'tls-drawer',
  templateUrl: './drawer.html',
  imports: [CdkPortalOutlet, Icon],
  // The whole panel is the drag surface, so the gesture belongs on the host. Its
  // inputs cannot be bound — the container is instantiated by the CDK, not from a
  // template — so `DrawerService` configures it through the `PAN_CONFIG` token.
  hostDirectives: [PanDirective],
  host: {
    '[class]': 'hostClasses()',
    '[style.--tls-drawer-size]': 'customSize',
  },
})
export class Drawer extends CdkDialogContainer {
  // Injections
  private readonly _tlsConfig = inject(DRAWER_PANEL_CONFIG);
  private readonly _dialogRef = inject(DialogRef);
  private readonly _directionality = inject(Directionality);
  // Named apart from the base container's own renderer and injector, which are
  // private to it. Both exist solely to serve the drag gesture.
  private readonly _dragRenderer = inject(Renderer2);
  private readonly _dragInjector = inject(Injector);
  private readonly _opening = inject(DRAWER_OPENING);
  private readonly _origin = this._opening.origin;

  // State
  // `open` marks an entrance the component finished itself (a drag); the
  // stylesheet's slide-in keys off `enter` only, so it does not replay then.
  private readonly _state = signal<'enter' | 'open' | 'leave'>('enter');
  private readonly _dragState = signal<drawerDragState>('idle');
  // Whether the panel slides out of its origin rather than from off-screen.
  // Taken for granted while an origin is given, and dropped the moment it
  // cannot be measured, which hands the entrance or exit back to the plain slide.
  private readonly _slidesFromOrigin = signal(this._origin !== null);
  // Whether the panel is still opening under a drag fed from outside; drives
  // the scripted class. `_openPhase` is where that opening stands.
  private readonly _opensByDrag = signal(this._opening.byDrag);
  private _openPhase: drawerOpenPhase = this._opening.byDrag ? 'pending' : 'done';
  private _openGesture: DrawerOpenGesture | null = null;
  // A drag can move, or even end, before the panel is laid out to measure;
  // what arrived by then is applied once the gesture exists.
  private _pendingOpenTravel: number | null = null;
  private _pendingOpenRelease: { event: PanEvent | null } | null = null;
  // A close asked for while a drag's settle open is still running, carried
  // out once the panel has arrived.
  private _queuedClose: { result: unknown } | null = null;
  // The running slide out of the origin, reversed if the drawer closes before
  // it ends: measured mid-flight, the panel would read short of where it rests.
  private _entrance: Animation[] = [];
  private _closing = false;
  // Panel extent along the drag axis, sampled once per gesture: the panel may be
  // sized by content or by a custom length, so only the rendered box is authoritative.
  private _dragExtent = 0;

  // Computed
  protected readonly hostClasses = computed(() => {
    const classes = [
      'tls-drawer',
      `tls-drawer--${this._tlsConfig.side}`,
      `tls-drawer--${this._sizeClass()}`,
      `tls-drawer--${this._state()}`,
    ];
    if (this._tlsConfig.rounded) classes.push('tls-drawer--rounded');
    if (this._tlsConfig.grabber) classes.push('tls-drawer--grabber');
    // The component, not the stylesheet, moves a panel that slides from its
    // origin or opens under a drag.
    if (this._slidesFromOrigin() || this._opensByDrag()) classes.push('tls-drawer--scripted');

    const dragState = this._dragState();
    if (dragState !== 'idle') classes.push(`tls-drawer--${dragState}`);

    return classes;
  });

  constructor() {
    super();

    // Subscribed rather than bound through host listeners: `$event` on a host
    // listener for a host directive's output is typed as a bare `Event`, so the
    // payload would have to be cast back. `panMove` stays outside the Angular
    // zone through a direct subscription, which is the point of it.
    const pan = inject(PanDirective);
    const subscriptions = [
      pan.panStart.subscribe(() => this._onPanStart()),
      pan.panMove.subscribe(event => this._onPanMove(event)),
      pan.panEnd.subscribe(event => this._onPanEnd(event)),
      pan.panCancel.subscribe(() => this._onPanCancel()),
    ];

    inject(DestroyRef).onDestroy(() => {
      for (const subscription of subscriptions) subscription.unsubscribe();
    });

    // Rendered but not yet painted: the panel is laid out where it rests, and
    // the plain slide is still held off by the scripted class, so its first
    // painted frame is already where the entrance starts.
    afterNextRender(() => {
      if (this._openPhase === 'pending') {
        this._beginOpenGesture();
        return;
      }
      this._slideFromOrigin();
    });
  }

  // Accessors
  protected get config(): DrawerPanelConfig {
    return this._tlsConfig;
  }

  // The custom CSS length applied inline when `size` is not a named token, else
  // `null` so the attribute is omitted and the size modifier class takes over.
  protected get customSize(): string | null {
    return this._isNamedSize(this._tlsConfig.size) ? null : this._tlsConfig.size;
  }

  // Public methods
  // Plays the slide-out animation, then disposes the overlay once it finishes.
  // Routed through here for every dismissal path (close button, backdrop, Escape)
  // because `DialogRef.close()` disposes synchronously, which would skip the exit.
  public animatedClose(result?: unknown): void {
    if (this._closing) return;

    switch (this._openPhase) {
      // Not laid out yet, so nothing is on screen to take away.
      case 'pending':
        this._closing = true;
        this._dialogRef.close(result);
        return;
      // Under the finger: settle back where the drag began, then close.
      case 'following':
        this._settleOpenGesture(false, result);
        return;
      // Settling open: finish arriving first, so the exit starts from rest.
      case 'settling':
        this._queuedClose = { result };
        return;
      case 'done':
        break;
    }

    this._closing = true;
    const host = this._elementRef.nativeElement;

    const running = this._entrance.filter(animation => animation.playState === 'running');
    if (running.length) {
      this._reverseEntrance(running, result);
      return;
    }

    const offset = this._slidesFromOrigin() ? this._measureOriginOffset() : null;
    this._state.set('leave');

    if (offset === null || this._origin === null) {
      this._slidesFromOrigin.set(false);
      afterLeaveAnimation(host, () => this._dialogRef.close(result));
      return;
    }

    const pairs = measureSharedPairs(host, this._origin, offset);
    slideToOrigin(host, offset, pairs, readSlideTiming(host, 'leave'));
    void whenAnimationsFinish(host).then(() => this._dialogRef.close(result));
  }

  /** See `DrawerRef.followOpenDrag`. */
  public followOpenDrag(event: PanEvent): void {
    // Travel toward open is travel away from the pinned edge.
    const travel = -this._dismissTravel(event);

    if (this._openPhase === 'pending') {
      this._pendingOpenTravel = travel;
    } else if (this._openPhase === 'following' && this._openGesture !== null) {
      this._openGesture.follow(travel);
    }
  }

  /** See `DrawerRef.releaseOpenDrag`. */
  public releaseOpenDrag(event: PanEvent | null): void {
    if (this._openPhase === 'pending') {
      this._pendingOpenRelease = { event };
      return;
    }
    if (this._openPhase !== 'following' || this._openGesture === null) return;

    const opens = event !== null && this._opensOnRelease(event, this._openGesture.progress);
    this._settleOpenGesture(opens, undefined);
  }

  // Protected methods
  protected close(): void {
    this.animatedClose();
  }

  // Private methods
  private _slideFromOrigin(): void {
    if (!this._slidesFromOrigin()) return;

    const host = this._elementRef.nativeElement;
    const offset = this._measureOriginOffset();
    if (offset === null || this._origin === null) {
      this._slidesFromOrigin.set(false);
      return;
    }

    const pairs = measureSharedPairs(host, this._origin, offset);
    this._entrance = slideFromOrigin(host, offset, pairs, readSlideTiming(host, 'enter'));
  }

  // Plays a slide out of the origin that is still running back to where it
  // began, from wherever it has got to, then closes. Held at the end, so the
  // panel does not flash back to rest before the overlay is disposed.
  private _reverseEntrance(running: Animation[], result: unknown): void {
    for (const animation of running) {
      const effect = animation.effect;
      if (effect !== null) effect.updateTiming({ fill: 'both' });
      animation.reverse();
    }
    void whenAnimationsFinish(this._elementRef.nativeElement).then(() =>
      this._dialogRef.close(result),
    );
  }

  // Ends a drag's opening, one way or the other. Settling closed is a close:
  // nothing else may start one meanwhile. Settling open hands the panel back
  // to the ordinary open state, then runs a close that arrived on the way.
  private _settleOpenGesture(open: boolean, result: unknown): void {
    const gesture = this._openGesture;
    if (gesture === null) return;

    this._openGesture = null;
    this._openPhase = 'settling';

    if (!open) {
      this._closing = true;
      gesture.settle(false, () => this._dialogRef.close(result));
      return;
    }

    gesture.settle(true, () => {
      this._openPhase = 'done';
      this._state.set('open');
      this._opensByDrag.set(false);

      const queued = this._queuedClose;
      this._queuedClose = null;
      if (queued !== null) this.animatedClose(queued.result);
    });
  }

  // Starts the scrubbed entrance a drag drives: from over the origin where the
  // panel covers it, else from off-screen. Direct manipulation, so it runs at
  // every motion level; only the settle after release is motion.
  private _beginOpenGesture(): void {
    const host = this._elementRef.nativeElement;
    const side = this._tlsConfig.side;
    const isRtl = this._directionality.value === 'rtl';
    const originOffset =
      this._origin === null ? null : measureOriginOffset(host, this._origin, side, isRtl);
    const offset = originOffset ?? offscreenOffset(host, side, isRtl);
    const pairs =
      originOffset === null || this._origin === null
        ? []
        : measureSharedPairs(host, this._origin, originOffset);
    this._slidesFromOrigin.set(originOffset !== null);

    this._openPhase = 'following';
    this._openGesture = new DrawerOpenGesture(
      host,
      offset,
      pairs,
      this._dialogRef.overlayRef.backdropElement,
      this._dragRenderer,
      this._settleTiming(),
    );

    const travel = this._pendingOpenTravel;
    const release = this._pendingOpenRelease;
    this._pendingOpenTravel = null;
    this._pendingOpenRelease = null;
    if (travel !== null) this._openGesture.follow(travel);
    if (release !== null) this.releaseOpenDrag(release.event);
  }

  // Either a flick decides, whichever way it points; failing one, how far the
  // drag got does — the same rule the drag to dismiss commits by.
  private _opensOnRelease(event: PanEvent, progress: number): boolean {
    const openVelocity = -this._dismissVelocity(event);
    if (openVelocity >= SWIPE_DEFAULT_MIN_VELOCITY) return true;
    if (-openVelocity >= SWIPE_DEFAULT_MIN_VELOCITY) return false;

    return progress >= DRAG_DISMISS_RATIO;
  }

  // The settle after a drag is released eases like the slide in, and jumps
  // where the motion level allows no motion.
  private _settleTiming(): DrawerSlideTiming {
    return this._isMotionAllowed()
      ? readSlideTiming(this._elementRef.nativeElement, 'enter')
      : { duration: 0, easing: 'linear' };
  }

  private _isMotionAllowed(): boolean {
    const motion = this._document.documentElement.getAttribute(MOTION_ATTRIBUTE);
    return motion === 'essential' || motion === 'full';
  }

  // Where the slide from the origin starts and ends, or null where it cannot
  // play: no origin, one the panel does not cover, or a motion level with no
  // entrance at all — where the plain slide stands down too, so falling back
  // to it animates nothing either.
  private _measureOriginOffset(): DrawerOffset | null {
    if (this._origin === null || !this._isMotionAllowed()) return null;

    return measureOriginOffset(
      this._elementRef.nativeElement,
      this._origin,
      this._tlsConfig.side,
      this._directionality.value === 'rtl',
    );
  }

  private _onPanStart(): void {
    if (this._closing || this._openPhase !== 'done') return;

    const rect = this._elementRef.nativeElement.getBoundingClientRect();
    this._dragExtent = this._isInlineSide() ? rect.width : rect.height;
    this._dragState.set('dragging');
    // The backdrop tracks the finger for the drag's duration, so its own
    // transition — which exists to animate the settle — must not lag it.
    this._setBackdropTransition('none');
  }

  // Fired outside the Angular zone (see `PanDirective.panMove`), so it writes to
  // the DOM directly and never touches a signal.
  // Move, end and cancel only follow a drag this panel started: one declined at
  // its start (closing, or still opening under the trigger's drag) is not its own.
  private _onPanMove(event: PanEvent): void {
    if (this._closing || this._dragState() !== 'dragging') return;
    this._applyDrag(this._dismissTravel(event));
  }

  private _onPanEnd(event: PanEvent): void {
    if (this._closing || this._dragState() !== 'dragging') return;

    // Either condition commits: a short flick is as clear an intent to dismiss as
    // a slow drag past the ratio, and requiring both would strand each on its own.
    const travelled =
      this._dragExtent > 0 && this._dismissTravel(event) / this._dragExtent >= DRAG_DISMISS_RATIO;
    const flicked = this._dismissVelocity(event) >= SWIPE_DEFAULT_MIN_VELOCITY;

    if (travelled || flicked) {
      this._dragClose();
      return;
    }

    this._settleBack();
  }

  private _onPanCancel(): void {
    if (this._closing || this._dragState() !== 'dragging') return;
    this._settleBack();
  }

  // Travel toward the panel's pinned edge in px. Negative while the finger moves
  // the other way, which the caller clamps away — the panel does not overshoot open.
  private _dismissTravel(event: PanEvent): number {
    switch (this._tlsConfig.side) {
      case 'top':
        return -event.deltaY;
      case 'bottom':
        return event.deltaY;
      case 'start':
        return -this._toLogical(event.deltaX);
      case 'end':
        return this._toLogical(event.deltaX);
    }
  }

  // Release velocity toward the pinned edge in px/ms. Signed independently of
  // `_dismissTravel`: a drag that reverses into a flick must read as the flick.
  private _dismissVelocity(event: PanEvent): number {
    switch (this._tlsConfig.side) {
      case 'top':
        return -event.velocityY;
      case 'bottom':
        return event.velocityY;
      case 'start':
        return -this._toLogical(event.velocityX);
      case 'end':
        return this._toLogical(event.velocityX);
    }
  }

  // Horizontal quantities arrive physical; the inline sides are logical, so the
  // sign flips in RTL.
  private _toLogical(physicalX: number): number {
    return this._directionality.value === 'rtl' ? -physicalX : physicalX;
  }

  private _isInlineSide(): boolean {
    const side = this._tlsConfig.side;
    return side === 'start' || side === 'end';
  }

  private _applyDrag(travel: number): void {
    const offset = Math.max(0, travel);
    this._dragRenderer.setStyle(
      this._elementRef.nativeElement,
      '--tls-drawer-drag',
      `${offset}px`,
      RendererStyleFlags2.DashCase,
    );

    const backdrop = this._dialogRef.overlayRef.backdropElement;
    if (backdrop === null) return;

    const progress = this._dragExtent > 0 ? Math.min(1, offset / this._dragExtent) : 0;
    this._dragRenderer.setStyle(backdrop, 'opacity', `${1 - progress}`);
  }

  private _setBackdropTransition(value: string | null): void {
    const backdrop = this._dialogRef.overlayRef.backdropElement;
    if (backdrop === null) return;

    if (value === null) {
      this._dragRenderer.removeStyle(backdrop, 'transition');
      return;
    }
    this._dragRenderer.setStyle(backdrop, 'transition', value);
  }

  // Returns the panel to rest after a drag that did not commit.
  private _settleBack(): void {
    this._settle(0, () => this._dragState.set('idle'));
  }

  // Continues the drag out to the pinned edge and disposes on arrival. A dismissal
  // that began as a drag cannot route through `animatedClose`: the slide-out
  // keyframe starts from `transform: none`, so the panel would snap back to fully
  // open for a frame before leaving.
  private _dragClose(): void {
    this._closing = true;
    this._settle(this._dragExtent, () => this._dialogRef.close());
  }

  private _settle(target: number, onDone: () => void): void {
    this._dragState.set('settling');
    this._setBackdropTransition(null);

    settleAfterRender(
      this._dragInjector,
      this._elementRef.nativeElement,
      () => this._applyDrag(target),
      onDone,
    );
  }

  private _sizeClass(): drawerSize | 'custom' {
    const size = this._tlsConfig.size;
    return this._isNamedSize(size) ? size : 'custom';
  }

  private _isNamedSize(size: drawerSize | string): size is drawerSize {
    return DRAWER_NAMED_SIZES.includes(size as drawerSize);
  }
}
