import { CdkDialogContainer, DialogRef } from '@angular/cdk/dialog';
import { CdkPortalOutlet } from '@angular/cdk/portal';
import { Component, inject } from '@angular/core';
import { Button } from '../button';
import { Icon } from '../icon';
import { DialogConfig } from './dialog.config';
import { DIALOG_CONFIG } from './dialog.token';

@Component({
  selector: 'tls-dialog',
  templateUrl: './dialog.html',
  imports: [CdkPortalOutlet, Button, Icon],
  host: { '[class]': 'hostClasses' },
})
export class Dialog extends CdkDialogContainer {
  private readonly _tlsConfig = inject(DIALOG_CONFIG);
  private readonly _dialogRef = inject(DialogRef);

  protected readonly hostClasses = ['tls-dialog', `tls-dialog--${this._tlsConfig.size}`];

  protected get config(): DialogConfig {
    return this._tlsConfig;
  }

  protected close(): void {
    this._dialogRef.close();
  }
}
