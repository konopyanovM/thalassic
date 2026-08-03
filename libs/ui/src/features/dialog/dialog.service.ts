import { Dialog as CdkDialog, DialogRef, DialogRole } from '@angular/cdk/dialog';
import { ComponentType } from '@angular/cdk/portal';
import { inject, Injectable } from '@angular/core';
import { Dialog } from './dialog';
import { DialogConfig } from './dialog.config';
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
  role?: DialogRole;
  ariaLabel?: string | null;
  ariaLabelledBy?: string | null;
  ariaDescribedBy?: string | null;
}

@Injectable({ providedIn: 'root' })
export class DialogService {
  private readonly _dialog = inject(CdkDialog);
  private readonly _config = inject(DIALOG_CONFIG);

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

    return this._dialog.open<R, D, C>(component, {
      container: {
        type: Dialog,
        providers: () => [{ provide: DIALOG_CONFIG, useValue: resolvedConfig }],
      },
      hasBackdrop: true,
      backdropClass: 'tls-dialog-backdrop',
      disableClose: !resolvedConfig.backdropClose,
      role: config?.role ?? 'dialog',
      ariaLabel: config?.ariaLabel ?? null,
      ariaLabelledBy: config?.ariaLabelledBy ?? null,
      ariaDescribedBy: config?.ariaDescribedBy ?? null,

      data: config?.data as D,
    });
  }

  public closeAll(): void {
    this._dialog.closeAll();
  }
}
