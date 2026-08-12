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
import { PanDirective, PanEvent, SWIPE_DEFAULT_MIN_VELOCITY } from '@thalassic/core';
import { afterLeaveAnimation, LEAVE_ANIMATION_FALLBACK_MS } from '../../abstract/overlay';
import { Icon } from '../icon';
import { DrawerConfig } from './drawer.config';
import { DRAWER_DISMISS_RATIO, DRAWER_NAMED_SIZES } from './drawer.constants';
import { DRAWER_CONFIG } from './drawer.token';
import { drawerDragState, drawerSize } from './drawer.types';

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
  private readonly _tlsConfig = inject(DRAWER_CONFIG);
  private readonly _dialogRef = inject(DialogRef);
  private readonly _directionality = inject(Directionality);
  // Named apart from the base container's own renderer and injector, which are
  // private to it. Both exist solely to serve the drag gesture.
  private readonly _dragRenderer = inject(Renderer2);
  private readonly _dragInjector = inject(Injector);

  // State
  private readonly _state = signal<'enter' | 'leave'>('enter');
  private readonly _dragState = signal<drawerDragState>('idle');
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
  }

  // Accessors
  protected get config(): DrawerConfig {
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
    this._closing = true;

    this._state.set('leave');
    afterLeaveAnimation(this._elementRef.nativeElement, () => this._dialogRef.close(result));
  }

  // Protected methods
  protected close(): void {
    this.animatedClose();
  }

  // Private methods
  private _onPanStart(): void {
    if (this._closing) return;

    const rect = this._elementRef.nativeElement.getBoundingClientRect();
    this._dragExtent = this._isInlineSide() ? rect.width : rect.height;
    this._dragState.set('dragging');
    // The backdrop tracks the finger for the drag's duration, so its own
    // transition — which exists to animate the settle — must not lag it.
    this._setBackdropTransition('none');
  }

  // Fired outside the Angular zone (see `PanDirective.panMove`), so it writes to
  // the DOM directly and never touches a signal.
  private _onPanMove(event: PanEvent): void {
    if (this._closing) return;
    this._applyDrag(this._dismissTravel(event));
  }

  private _onPanEnd(event: PanEvent): void {
    if (this._closing) return;

    // Either condition commits: a short flick is as clear an intent to dismiss as
    // a slow drag past the ratio, and requiring both would strand each on its own.
    const travelled =
      this._dragExtent > 0 && this._dismissTravel(event) / this._dragExtent >= DRAWER_DISMISS_RATIO;
    const flicked = this._dismissVelocity(event) >= SWIPE_DEFAULT_MIN_VELOCITY;

    if (travelled || flicked) {
      this._dragClose();
      return;
    }

    this._settleBack();
  }

  private _onPanCancel(): void {
    if (this._closing) return;
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

    // The settle transition lives on the `--settling` class, so the target value
    // must not be written until change detection has put that class on the host —
    // set in the same frame, the property would jump instead of animating.
    afterNextRender(
      () => {
        this._applyDrag(target);
        this._afterSettle(onDone);
      },
      { injector: this._dragInjector },
    );
  }

  // Runs `onDone` once the settle transition finishes, or at once when no
  // transition is emitted (the `none` motion level), so a drawer dismissed by
  // drag still closes when the user has asked for no motion.
  private _afterSettle(onDone: () => void): void {
    const host = this._elementRef.nativeElement;
    // `transitionDuration` is a comma-separated list, and is absent entirely
    // where the engine reports no transition at all, so the test is whether any
    // entry actually lasts — not equality against a single `0s`.
    const runs = getComputedStyle(host)
      .transitionDuration.split(',')
      .some(duration => parseFloat(duration) > 0);
    if (!runs) {
      onDone();
      return;
    }

    let settled = false;
    const finalize = (): void => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      host.removeEventListener('transitionend', onTransitionEnd);
      onDone();
    };

    // Only the panel's own transform settles it; ignore `transitionend` bubbling
    // up from animated content inside it.
    const onTransitionEnd = (event: TransitionEvent): void => {
      if (event.target === host && event.propertyName === 'transform') finalize();
    };

    host.addEventListener('transitionend', onTransitionEnd);
    // Safety net if `transitionend` never arrives (e.g. the panel is torn down early).
    const timeoutId = window.setTimeout(finalize, LEAVE_ANIMATION_FALLBACK_MS);
  }

  private _sizeClass(): drawerSize | 'custom' {
    const size = this._tlsConfig.size;
    return this._isNamedSize(size) ? size : 'custom';
  }

  private _isNamedSize(size: drawerSize | string): size is drawerSize {
    return DRAWER_NAMED_SIZES.includes(size as drawerSize);
  }
}
