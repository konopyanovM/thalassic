import { DialogRef as CdkDialogRef } from '@angular/cdk/dialog';
import { Observable } from 'rxjs';
import { Dialog } from './dialog';

/**
 * Handle to an open dialog. Provided to the dialog's content component (inject it
 * instead of the CDK `DialogRef`) and returned from {@link DialogService.open}.
 *
 * `close` routes through the container so the exit animation plays before the
 * overlay is disposed, unlike the CDK `DialogRef` which disposes synchronously.
 */
export class DialogRef<R = unknown, C = unknown> {
  public readonly closed: Observable<R | undefined>;

  constructor(
    private readonly _cdkRef: CdkDialogRef<R, C>,
    private readonly _container: Dialog,
  ) {
    this.closed = _cdkRef.closed;
  }

  public get componentInstance(): C | null {
    return this._cdkRef.componentInstance;
  }

  public close(result?: R): void {
    this._container.animatedClose(result);
  }
}
