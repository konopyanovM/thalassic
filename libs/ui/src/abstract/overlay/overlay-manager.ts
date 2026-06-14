import {
  ConnectedPosition,
  FlexibleConnectedPositionStrategyOrigin,
  Overlay,
  OverlayRef,
  OverlaySizeConfig,
} from '@angular/cdk/overlay';
import { TemplatePortal } from '@angular/cdk/portal';
import { DestroyRef, inject, signal, TemplateRef, ViewContainerRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';

const TRANSPARENT_BACKDROP_CLASS = 'cdk-overlay-transparent-backdrop';

export interface ConnectedOverlayConfig {
  /** Template projected into the overlay. */
  content: TemplateRef<unknown>;
  /** Element or point the overlay is anchored to. */
  origin: FlexibleConnectedPositionStrategyOrigin;
  /** Connected positions to try, in order of preference. */
  positions: ConnectedPosition[];
  /** Forwarded to the position strategy. Defaults to the CDK default (true). */
  flexibleDimensions?: boolean;
  /** Forwarded to the position strategy. Defaults to the CDK default (true). */
  push?: boolean;
  /** Scroll handling while open. Defaults to `'reposition'`. */
  scrollStrategy?: 'reposition' | 'close';
  /** Whether to render a backdrop. Defaults to `true`. */
  hasBackdrop?: boolean;
  /** Backdrop class when a backdrop is rendered. Defaults to the transparent backdrop. */
  backdropClass?: string;
  /** Extra class(es) applied to the overlay pane. */
  panelClass?: string | string[];
  /** Close when the backdrop is clicked. Defaults to `true` when a backdrop is rendered. */
  closeOnBackdropClick?: boolean;
  /** Close on an outside pointer event. Defaults to `true` when no backdrop is rendered. */
  closeOnOutsidePointer?: boolean;
  /** Close when Escape is pressed. Defaults to `true`. */
  closeOnEscape?: boolean;
  /** Minimum width applied to the pane on every open (e.g. to match a trigger). */
  minWidth?: number | string;
  /**
   * Keep the overlay alive across open/close (detach instead of dispose), so the
   * same instance is reused on the next open. Defaults to `false`.
   */
  reuse?: boolean;
  /** Invoked after the overlay closes, from any cause (explicit, backdrop, outside, Escape). */
  onClose?: () => void;
}

/**
 * Owns the CDK-Overlay lifecycle shared by the library's connected overlay
 * components (popover, menu, select): create/attach, dismissal wiring
 * (backdrop / outside-pointer / Escape), `isOpen` state, and disposal. The
 * positional and dismissal differences between components are expressed through
 * {@link ConnectedOverlayConfig} rather than duplicated per component.
 *
 * Create one via {@link createOverlayManager} from a component field initializer
 * so it is bound to the host's injection context.
 */
export class OverlayManager {
  private readonly _overlay = inject(Overlay);
  private readonly _viewContainerRef = inject(ViewContainerRef);
  private readonly _destroyRef = inject(DestroyRef);

  private _overlayRef: OverlayRef | null = null;
  private _config: ConnectedOverlayConfig | null = null;
  private readonly _isOpen = signal(false);

  public readonly isOpen = this._isOpen.asReadonly();

  // Dispose the overlay with the host. Registered in a field initializer so no
  // constructor is needed.
  private readonly _teardown = this._destroyRef.onDestroy(() => this._dispose());

  public open(config: ConnectedOverlayConfig): void {
    if (this._isOpen()) return;

    this._config = config;

    if (!this._overlayRef) {
      this._overlayRef = this._overlay.create({
        positionStrategy: this._buildPositionStrategy(config),
        scrollStrategy:
          config.scrollStrategy === 'close'
            ? this._overlay.scrollStrategies.close()
            : this._overlay.scrollStrategies.reposition(),
        hasBackdrop: config.hasBackdrop ?? true,
        backdropClass: config.backdropClass ?? TRANSPARENT_BACKDROP_CLASS,
        ...(config.panelClass != null && { panelClass: config.panelClass }),
      });

      this._wireDismissal(this._overlayRef, config);
    }

    if (config.minWidth != null) {
      this._overlayRef.updateSize({ minWidth: config.minWidth } satisfies OverlaySizeConfig);
    }

    this._overlayRef.attach(new TemplatePortal(config.content, this._viewContainerRef));
    this._isOpen.set(true);
  }

  public close(): void {
    if (!this._isOpen()) return;

    if (this._config?.reuse) {
      this._overlayRef?.detach();
    } else {
      this._overlayRef?.dispose();
      this._overlayRef = null;
    }

    this._isOpen.set(false);
    this._config?.onClose?.();
  }

  // Private
  private _buildPositionStrategy(config: ConnectedOverlayConfig) {
    let strategy = this._overlay
      .position()
      .flexibleConnectedTo(config.origin)
      .withPositions(config.positions);

    if (config.flexibleDimensions === false) strategy = strategy.withFlexibleDimensions(false);
    if (config.push === false) strategy = strategy.withPush(false);

    return strategy;
  }

  private _wireDismissal(overlayRef: OverlayRef, config: ConnectedOverlayConfig): void {
    const hasBackdrop = config.hasBackdrop ?? true;

    if (config.closeOnBackdropClick ?? hasBackdrop) {
      overlayRef
        .backdropClick()
        .pipe(takeUntilDestroyed(this._destroyRef))
        .subscribe(() => this.close());
    }

    if (config.closeOnOutsidePointer ?? !hasBackdrop) {
      overlayRef
        .outsidePointerEvents()
        .pipe(
          takeUntilDestroyed(this._destroyRef),
          filter(event => event.type === 'click' || event.type === 'auxclick'),
        )
        .subscribe(() => this.close());
    }

    if (config.closeOnEscape ?? true) {
      overlayRef
        .keydownEvents()
        .pipe(
          takeUntilDestroyed(this._destroyRef),
          filter(event => event.key === 'Escape'),
        )
        .subscribe(() => this.close());
    }
  }

  private _dispose(): void {
    this._overlayRef?.dispose();
    this._overlayRef = null;
  }
}

/**
 * Creates an {@link OverlayManager} bound to the current injection context.
 * Call from a component/directive field initializer or constructor.
 */
export function createOverlayManager(): OverlayManager {
  return new OverlayManager();
}
