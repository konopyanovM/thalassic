import { Directionality } from '@angular/cdk/bidi';
import { Dialog as CdkDialog, DialogRef, DialogRole } from '@angular/cdk/dialog';
import { Overlay, PositionStrategy } from '@angular/cdk/overlay';
import { ComponentType } from '@angular/cdk/portal';
import { inject, Injectable } from '@angular/core';
import { DEFAULT_PAN_CONFIG, PAN_CONFIG, PanConfig } from '@thalassic/core';
import { filter, takeUntil } from 'rxjs';
import { Drawer } from './drawer';
import { DRAWER_DRAG_POINTER_TYPES } from './drawer.constants';
import { DrawerConfig } from './drawer.config';
import { DrawerRef } from './drawer-ref';
import { DRAWER_CONFIG } from './drawer.token';
import { drawerSide, drawerSize } from './drawer.types';

export interface DrawerOpenConfig<D = unknown> {
  data?: D | null;
  side?: drawerSide;
  size?: drawerSize | string;
  closeable?: boolean;
  backdropClose?: boolean;
  /** Dismisses the drawer on Escape. Independent of `backdropClose`. */
  escapeClose?: boolean;
  rounded?: boolean;
  /**
   * Renders a grabber pill on the edge facing the viewport and makes the panel
   * draggable toward that edge to dismiss.
   */
  grabber?: boolean;
  /** Accessible name for the close button. */
  closeLabel?: string;
  role?: DialogRole;
  ariaLabel?: string | null;
  ariaLabelledBy?: string | null;
  ariaDescribedBy?: string | null;
}

@Injectable({ providedIn: 'root' })
export class DrawerService {
  private readonly _dialog = inject(CdkDialog);
  private readonly _overlay = inject(Overlay);
  private readonly _directionality = inject(Directionality);
  private readonly _config = inject(DRAWER_CONFIG);

  // Currently-open drawers, tracked so `closeAll` can play each slide-out and so it
  // closes drawers only (the CDK `Dialog` is shared with `tls-dialog`).
  private readonly _openDrawers = new Set<DrawerRef>();

  public open<R = unknown, D = unknown, C = unknown>(
    component: ComponentType<C>,
    config?: DrawerOpenConfig<D>,
  ): DrawerRef<R, C> {
    const resolvedConfig: DrawerConfig = {
      side: config?.side ?? this._config.side,
      size: config?.size ?? this._config.size,
      closeable: config?.closeable ?? this._config.closeable,
      backdropClose: config?.backdropClose ?? this._config.backdropClose,
      escapeClose: config?.escapeClose ?? this._config.escapeClose,
      rounded: config?.rounded ?? this._config.rounded,
      grabber: config?.grabber ?? this._config.grabber,
      closeLabel: config?.closeLabel ?? this._config.closeLabel,
    };

    let drawerRef!: DrawerRef<R, C>;

    const dialogRef = this._dialog.open<R, D, C>(component, {
      container: {
        type: Drawer,
        providers: () => [
          { provide: DRAWER_CONFIG, useValue: resolvedConfig },
          { provide: PAN_CONFIG, useValue: this._buildPanConfig(resolvedConfig) },
        ],
      },
      // Built against the content injector so the drawer's content can `inject(DrawerRef)`
      // to close itself. The same instance is returned to the caller below.
      providers: (cdkRef, _cdkConfig, container) => {
        drawerRef = new DrawerRef(cdkRef as DialogRef<R, C>, container as Drawer);
        return [{ provide: DrawerRef, useValue: drawerRef }];
      },
      positionStrategy: this._buildPositionStrategy(resolvedConfig.side),
      direction: this._directionality.value,
      hasBackdrop: true,
      backdropClass: 'tls-drawer-backdrop',
      // Suppress CDK's synchronous auto-close so every dismissal routes through
      // `DrawerRef.close`, which plays the slide-out before disposal.
      disableClose: true,
      role: config?.role ?? 'dialog',
      ariaLabel: config?.ariaLabel ?? null,
      ariaLabelledBy: config?.ariaLabelledBy ?? null,
      ariaDescribedBy: config?.ariaDescribedBy ?? null,

      data: config?.data as D,
    });

    const trackedRef = drawerRef as DrawerRef;
    this._openDrawers.add(trackedRef);
    dialogRef.closed.subscribe(() => this._openDrawers.delete(trackedRef));

    this._wireDismissal(dialogRef, drawerRef, resolvedConfig);

    return drawerRef;
  }

  public closeAll(): void {
    // Iterating a snapshot: `close` is animated, so removal happens later (on
    // `closed`), but guard against any synchronous mutation regardless.
    for (const drawerRef of [...this._openDrawers]) drawerRef.close();
  }

  // Private
  // The drag gesture lives on the drawer container, whose inputs cannot be bound
  // because the CDK instantiates it rather than a template, so its configuration
  // is handed down through the injector instead.
  private _buildPanConfig(config: DrawerConfig): PanConfig {
    return {
      ...DEFAULT_PAN_CONFIG,
      // The grabber is the affordance for the gesture, so the pill and the drag
      // are one decision — a visible grabber is always draggable, and a panel
      // without one carries no gesture at all.
      enabled: config.grabber,
      // Locked to the panel's own axis so the browser keeps the cross axis and
      // content inside the drawer still scrolls natively.
      axis: config.side === 'top' || config.side === 'bottom' ? 'y' : 'x',
      pointerTypes: DRAWER_DRAG_POINTER_TYPES,
    };
  }

  private _buildPositionStrategy(side: drawerSide): PositionStrategy {
    const position = this._overlay.position().global();
    const isRtl = this._directionality.value === 'rtl';

    switch (side) {
      case 'top':
        return position.top('0').left('0');
      case 'bottom':
        return position.bottom('0').left('0');
      // `start`/`end` are logical: `start` pins to the leading edge (left in LTR,
      // right in RTL), `end` to the trailing edge.
      case 'start':
        return isRtl ? position.top('0').right('0') : position.top('0').left('0');
      case 'end':
        return isRtl ? position.top('0').left('0') : position.top('0').right('0');
    }
  }

  private _wireDismissal<R, C>(
    dialogRef: DialogRef<R, C>,
    drawerRef: DrawerRef<R, C>,
    config: DrawerConfig,
  ): void {
    // Gated separately: a drawer that ignores backdrop clicks must still be
    // dismissable from the keyboard unless the caller opts out of that too.
    if (config.backdropClose) {
      dialogRef.backdropClick.pipe(takeUntil(dialogRef.closed)).subscribe(() => drawerRef.close());
    }

    if (config.escapeClose) {
      dialogRef.keydownEvents
        .pipe(
          takeUntil(dialogRef.closed),
          filter(event => event.key === 'Escape'),
        )
        .subscribe(() => drawerRef.close());
    }
  }
}
