import {
  ConnectedPosition,
  FlexibleConnectedPositionStrategyOrigin,
  Overlay,
  OverlayRef,
} from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { ComponentRef, inject, Injectable } from '@angular/core';
import { LEAVE_ANIMATION_FALLBACK_MS } from './tooltip.constants';

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

  // Detaches the tooltip so Angular's `animate.leave` plays the exit animation,
  // then disposes the pane once that animation finishes. The pane is kept alive
  // in the meantime so it is not torn down mid-animation.
  public hide() {
    if (!this._overlayRef) return;

    const overlayRef = this._overlayRef;
    this._overlayRef = null;

    overlayRef.detach();
    this._disposeAfterAnimation(overlayRef);
  }

  public dispose() {
    if (!this._overlayRef) return;
    this._overlayRef.dispose();
    this._overlayRef = null;
  }

  // Private methods
  // Disposes a detached overlay once the tooltip's exit animation has finished.
  // Falls back to a timeout when no animation runs (e.g. the `none` motion level).
  private _disposeAfterAnimation(overlayRef: OverlayRef) {
    const paneElement = overlayRef.overlayElement;
    if (!paneElement) {
      overlayRef.dispose();
      return;
    }

    let settled = false;
    const finalize = () => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timeoutId);
      paneElement.removeEventListener('animationend', finalize);
      overlayRef.dispose();
    };

    paneElement.addEventListener('animationend', finalize);
    const timeoutId = window.setTimeout(finalize, LEAVE_ANIMATION_FALLBACK_MS);
  }
}
