import {
  ConnectedPosition,
  FlexibleConnectedPositionStrategy,
  FlexibleConnectedPositionStrategyOrigin,
  Overlay,
  OverlayRef,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, inject, Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { disposeAfterLeaveAnimation } from '../../abstract/overlay';
import { OverlayArrowPosition } from '../../types';
import { resolveOverlayArrowPosition } from '../../utils';
import { Tooltip } from './tooltip';

@Injectable()
export class TooltipService {
  // Injections
  private _overlay: Overlay = inject(Overlay);

  // State
  private _overlayRef: OverlayRef | null = null;
  private _tooltipRef: ComponentRef<Tooltip> | null = null;
  private _positionSubscription: Subscription | null = null;
  /**
   * Edge the visible tooltip settled on. The strategy applies its position while the portal is
   * still attaching, so the first change arrives before there is a component to hand it to.
   */
  private _arrowPosition: OverlayArrowPosition | null = null;

  // Public methods
  public show(
    origin: FlexibleConnectedPositionStrategyOrigin,
    positions: ConnectedPosition[],
  ): ComponentRef<Tooltip> {
    this.dispose();

    this._overlayRef = this._overlay.create({
      positionStrategy: this._createPositionStrategy(origin, positions),
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
    });

    this._tooltipRef = this._overlayRef.attach(new ComponentPortal(Tooltip));
    this._tooltipRef.instance.arrowPosition.set(this._arrowPosition);

    return this._tooltipRef;
  }

  public move(origin: FlexibleConnectedPositionStrategyOrigin, positions: ConnectedPosition[]) {
    if (!this._overlayRef) return;

    this._overlayRef.updatePositionStrategy(this._createPositionStrategy(origin, positions));
  }

  // Detaches the tooltip so Angular's `animate.leave` plays the exit animation,
  // then disposes the pane once that animation finishes. The pane is kept alive
  // in the meantime so it is not torn down mid-animation.
  public hide() {
    if (!this._overlayRef) return;

    const overlayRef = this._overlayRef;
    this._overlayRef = null;
    this._reset();

    overlayRef.detach();
    disposeAfterLeaveAnimation(overlayRef);
  }

  public dispose() {
    if (!this._overlayRef) return;

    this._overlayRef.dispose();
    this._overlayRef = null;
    this._reset();
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

    return positionStrategy;
  }

  /** Drops everything tied to the overlay that just went away. */
  private _reset(): void {
    this._tooltipRef = null;
    this._arrowPosition = null;

    if (!this._positionSubscription) return;

    this._positionSubscription.unsubscribe();
    this._positionSubscription = null;
  }
}
