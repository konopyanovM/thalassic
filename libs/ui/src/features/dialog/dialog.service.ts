import {
  Dialog as CdkDialog,
  DialogRef as CdkDialogRef,
  DialogRole,
} from '@angular/cdk/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { inject, Injectable } from '@angular/core';
import { filter, takeUntil } from 'rxjs';
import { Dialog } from './dialog';
import { DialogConfig } from './dialog.config';
import { DialogRef } from './dialog-ref';
import { DIALOG_CONFIG } from './dialog.token';
import { dialogFooterAlign, dialogSize } from './dialog.types';

export interface DialogOpenConfig<D = unknown> {
  data?: D | null;
  size?: dialogSize;
  closeable?: boolean;
  backdropClose?: boolean;
  /** Accessible name for the close button. */
  closeLabel?: string;
  /** Alignment for this dialog's `tls-dialog-footer` when it sets none itself. */
  footerAlign?: dialogFooterAlign;
  /**
   * Extra class(es) placed on the overlay pane, so one dialog can carry its own
   * treatment where the shared one does not fit.
   *
   * The pane sits outside every component's template and carries no style
   * encapsulation attribute, so a consumer's scoped rules cannot otherwise reach
   * it. A class named here is the handle they get. The dialog declares its own
   * `--tls-dialog-*` properties, which beat anything inherited from the pane, so
   * a rule that retunes one has to name the dialog too: `.<class> .tls-dialog`.
   * The backdrop is the pane's sibling rather than its child, so it is not reached.
   */
  panelClass?: string | string[];
  role?: DialogRole;
  ariaLabel?: string | null;
  ariaLabelledBy?: string | null;
  ariaDescribedBy?: string | null;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly _dialog = inject(CdkDialog);
  private readonly _config = inject(DIALOG_CONFIG);

  /**
   * Currently-open dialogs, tracked so `closeAll` can play each exit animation and
   * so it closes dialogs only (the CDK `Dialog` is shared with `tls-drawer`).
   */
  private readonly _openDialogs = new Set<DialogRef>();

  public open<R = unknown, D = unknown, C = unknown>(
    component: ComponentType<C>,
    config?: DialogOpenConfig<D>,
  ): DialogRef<R, C> {
    const resolvedConfig: DialogConfig = {
      size: config?.size ?? this._config.size,
      closeable: config?.closeable ?? this._config.closeable,
      backdropClose: config?.backdropClose ?? this._config.backdropClose,
      closeLabel: config?.closeLabel ?? this._config.closeLabel,
      footerAlign: config?.footerAlign ?? this._config.footerAlign,
    };

    let dialogRef!: DialogRef<R, C>;

    const cdkRef = this._dialog.open<R, D, C>(component, {
      container: {
        type: Dialog,
        providers: () => [{ provide: DIALOG_CONFIG, useValue: resolvedConfig }],
      },
      // Built against the content injector so the dialog's content can `inject(DialogRef)`
      // to close itself. The same instance is returned to the caller below.
      providers: (ref, _cdkConfig, container) => {
        dialogRef = new DialogRef(ref as CdkDialogRef<R, C>, container as Dialog);
        return [{ provide: DialogRef, useValue: dialogRef }];
      },
      hasBackdrop: true,
      backdropClass: 'tls-dialog-backdrop',
      panelClass: config?.panelClass ?? [],
      // Suppress CDK's synchronous auto-close so every dismissal routes through
      // `DialogRef.close`, which plays the exit animation before disposal.
      disableClose: true,
      role: config?.role ?? 'dialog',
      ariaLabel: config?.ariaLabel ?? null,
      ariaLabelledBy: config?.ariaLabelledBy ?? null,
      ariaDescribedBy: config?.ariaDescribedBy ?? null,

      data: config?.data as D,
    });

    const trackedRef = dialogRef as DialogRef;
    this._openDialogs.add(trackedRef);
    cdkRef.closed.subscribe(() => this._openDialogs.delete(trackedRef));

    this._wireDismissal(cdkRef, dialogRef, resolvedConfig);

    return dialogRef;
  }

  public closeAll(): void {
    // Iterating a snapshot: `close` is animated, so removal happens later (on
    // `closed`), but guard against any synchronous mutation regardless.
    for (const dialogRef of [...this._openDialogs]) dialogRef.close();
  }

  // Private methods
  private _wireDismissal<R, C>(
    cdkRef: CdkDialogRef<R, C>,
    dialogRef: DialogRef<R, C>,
    config: DialogConfig,
  ): void {
    if (!config.backdropClose) return;

    cdkRef.backdropClick.pipe(takeUntil(cdkRef.closed)).subscribe(() => dialogRef.close());

    cdkRef.keydownEvents
      .pipe(
        takeUntil(cdkRef.closed),
        filter(event => event.key === 'Escape'),
      )
      .subscribe(() => dialogRef.close());
  }
}
