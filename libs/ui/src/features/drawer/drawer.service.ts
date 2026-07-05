import { Dialog as CdkDialog, DialogRef, DialogRole } from '@angular/cdk/dialog';
import { Overlay, PositionStrategy } from '@angular/cdk/overlay';
import { ComponentType } from '@angular/cdk/portal';
import { inject, Injectable } from '@angular/core';
import { filter, takeUntil } from 'rxjs';
import { Drawer } from './drawer';
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
  rounded?: boolean;
  role?: DialogRole;
  ariaLabel?: string | null;
  ariaLabelledBy?: string | null;
  ariaDescribedBy?: string | null;
}

@Injectable({ providedIn: 'root' })
export class DrawerService {
  private readonly _dialog = inject(CdkDialog);
  private readonly _overlay = inject(Overlay);
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
      rounded: config?.rounded ?? this._config.rounded,
    };

    let drawerRef!: DrawerRef<R, C>;

    const dialogRef = this._dialog.open<R, D, C>(component, {
      container: {
        type: Drawer,
        providers: () => [{ provide: DRAWER_CONFIG, useValue: resolvedConfig }],
      },
      // Built against the content injector so the drawer's content can `inject(DrawerRef)`
      // to close itself. The same instance is returned to the caller below.
      providers: (cdkRef, _cdkConfig, container) => {
        drawerRef = new DrawerRef(cdkRef as DialogRef<R, C>, container as Drawer);
        return [{ provide: DrawerRef, useValue: drawerRef }];
      },
      positionStrategy: this._buildPositionStrategy(resolvedConfig.side),
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
  private _buildPositionStrategy(side: drawerSide): PositionStrategy {
    const position = this._overlay.position().global();

    switch (side) {
      case 'start':
        return position.top('0').left('0');
      case 'end':
        return position.top('0').right('0');
      case 'top':
        return position.top('0').left('0');
      case 'bottom':
        return position.bottom('0').left('0');
    }
  }

  private _wireDismissal<R, C>(
    dialogRef: DialogRef<R, C>,
    drawerRef: DrawerRef<R, C>,
    config: DrawerConfig,
  ): void {
    if (!config.backdropClose) return;

    dialogRef.backdropClick
      .pipe(takeUntil(dialogRef.closed))
      .subscribe(() => drawerRef.close());

    dialogRef.keydownEvents
      .pipe(
        takeUntil(dialogRef.closed),
        filter(event => event.key === 'Escape'),
      )
      .subscribe(() => drawerRef.close());
  }
}
