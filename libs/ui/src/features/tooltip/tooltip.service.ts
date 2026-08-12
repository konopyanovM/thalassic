import {
  ConnectedPosition,
  FlexibleConnectedPositionStrategy,
  FlexibleConnectedPositionStrategyOrigin,
  Overlay,
  OverlayRef
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, inject, Service } from '@angular/core';
import { Point } from '@thalassic/core';
import { Subscription } from 'rxjs';
import { disposeAfterLeaveAnimation } from '../../abstract/overlay';
import { OverlayArrowPosition } from '../../types';
import { resolveOverlayArrowPosition } from '../../utils';
import { Tooltip } from './tooltip';
import { TooltipOwner } from './tooltip.types';

/**
 * Owns the one tooltip overlay every trigger shares. A single tooltip is visible at a time
 * across the page: opening one asks whoever holds the current tooltip to let go first, so a
 * hovered element and a focused element elsewhere cannot leave two bubbles on screen.
 *
 * Every call names the trigger making it and is ignored unless that trigger holds the visible
 * tooltip, so one tearing itself down can never close a tooltip that has since moved on.
 */
@Service()
export class TooltipService {
  // Injections
  private readonly _overlay: Overlay = inject(Overlay);

  // State
  private _owner: TooltipOwner | null = null;
  private _overlayRef: OverlayRef | null = null;
  private _tooltipRef: ComponentRef<Tooltip> | null = null;
  private _positionStrategy: FlexibleConnectedPositionStrategy | null = null;
  private _positionSubscription: Subscription | null = null;
  /**
   * Edge the visible tooltip settled on. The strategy applies its position while the portal is
   * still attaching, so the first change arrives before there is a component to hand it to.
   */
  private _arrowPosition: OverlayArrowPosition | null = null;

  // Public methods
  public show(
    owner: TooltipOwner,
    origin: FlexibleConnectedPositionStrategyOrigin,
    positions: ConnectedPosition[],
  ): ComponentRef<Tooltip> {
    this._releaseOwner();

    this._owner = owner;
    this._overlayRef = this._overlay.create({
      positionStrategy: this._createPositionStrategy(origin, positions),
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
    });

    this._tooltipRef = this._overlayRef.attach(new ComponentPortal(Tooltip));
    this._tooltipRef.instance.arrowPosition.set(this._arrowPosition);

    return this._tooltipRef;
  }

  /** Re-anchors the visible tooltip, following a cursor it is bound to. */
  public move(owner: TooltipOwner, point: Point): void {
    if (this._owner !== owner) return;

    const overlayRef = this._overlayRef;
    const positionStrategy = this._positionStrategy;
    if (!overlayRef || !positionStrategy) return;

    // Re-targeting the strategy already attached, rather than building a replacement, keeps a
    // stream of pointer moves from allocating a strategy and a subscription per event.
    positionStrategy.setOrigin(point);
    overlayRef.updatePosition();
  }

  /**
   * Detaches the tooltip so Angular's `animate.leave` plays the exit animation, then disposes the
   * pane once that animation finishes. The pane is kept alive in the meantime so it is not torn
   * down mid-animation.
   */
  public hide(owner: TooltipOwner): void {
    if (this._owner !== owner) return;

    const overlayRef = this._overlayRef;
    this._overlayRef = null;
    this._reset();
    if (!overlayRef) return;

    overlayRef.detach();
    disposeAfterLeaveAnimation(overlayRef);
  }

  public dispose(owner: TooltipOwner): void {
    if (this._owner !== owner) return;

    this._disposeOverlay();
  }

  // Private methods
  /**
   * Builds a strategy that reports where it settled, so the tooltip points its arrow at the
   * position actually used rather than the one asked for.
   */
  private _createPositionStrategy(
    origin: FlexibleConnectedPositionStrategyOrigin,
    positions: ConnectedPosition[],
  ): FlexibleConnectedPositionStrategy {
    const positionStrategy = this._overlay
      .position()
      .flexibleConnectedTo(origin)
      .withPositions(positions);

    if (this._positionSubscription) this._positionSubscription.unsubscribe();

    this._positionSubscription = positionStrategy.positionChanges.subscribe(change => {
      this._arrowPosition = resolveOverlayArrowPosition(change.connectionPair);

      const tooltipRef = this._tooltipRef;
      if (!tooltipRef) return;

      tooltipRef.instance.arrowPosition.set(this._arrowPosition);
    });

    this._positionStrategy = positionStrategy;

    return positionStrategy;
  }

  /** Takes the tooltip back from its owner, so the next one starts from an empty stage. */
  private _releaseOwner(): void {
    const owner = this._owner;
    if (owner) owner.releaseTooltip();

    // An owner that did not let go leaves its overlay behind, and it cannot outlive the tooltip
    // replacing it.
    this._disposeOverlay();
  }

  private _disposeOverlay(): void {
    const overlayRef = this._overlayRef;
    this._overlayRef = null;
    this._reset();
    if (!overlayRef) return;

    overlayRef.dispose();
  }

  /** Drops everything tied to the overlay that just went away. */
  private _reset(): void {
    this._owner = null;
    this._tooltipRef = null;
    this._positionStrategy = null;
    this._arrowPosition = null;

    if (!this._positionSubscription) return;

    this._positionSubscription.unsubscribe();
    this._positionSubscription = null;
  }
}
