import {
  ConnectedPosition,
  FlexibleConnectedPositionStrategyOrigin,
  Overlay,
  OverlayRef,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, inject, Injectable } from '@angular/core';

@Injectable()
export class TooltipService {
  private _overlay: Overlay = inject(Overlay);

  private _overlayRef: OverlayRef | null = null;

  // Public methods
  public show<T>(
    origin: FlexibleConnectedPositionStrategyOrigin,
    positions: ConnectedPosition[],
    tooltipPortal: ComponentPortal<T>,
  ): ComponentRef<T> {
    this.dispose();

    const positionStrategy = this._overlay
      .position()
      .flexibleConnectedTo(origin)
      .withPositions(positions);

    this._overlayRef = this._overlay.create({
      positionStrategy,
      scrollStrategy: this._overlay.scrollStrategies.reposition(),
    });

    return this._overlayRef.attach(tooltipPortal);
  }

  public move(origin: FlexibleConnectedPositionStrategyOrigin, positions: ConnectedPosition[]) {
    if (this._overlayRef) {
      const positionStrategy = this._overlay
        .position()
        .flexibleConnectedTo(origin)
        .withPositions(positions);
      this._overlayRef.updatePositionStrategy(positionStrategy);
    }
  }

  public dispose() {
    if (!this._overlayRef) return;
    this._overlayRef.dispose();
    this._overlayRef = null;
  }
}
