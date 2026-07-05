import { DialogRef } from '@angular/cdk/dialog';
import { Observable } from 'rxjs';
import { Drawer } from './drawer';

/**
 * Handle to an open drawer. Provided to the drawer's content component (inject it
 * instead of the CDK `DialogRef`) and returned from {@link DrawerService.open}.
 *
 * `close` routes through the container so the slide-out animation plays before the
 * overlay is disposed, unlike the CDK `DialogRef` which disposes synchronously.
 */
export class DrawerRef<R = unknown, C = unknown> {
  public readonly closed: Observable<R | undefined>;

  constructor(
    private readonly _dialogRef: DialogRef<R, C>,
    private readonly _container: Drawer,
  ) {
    this.closed = _dialogRef.closed;
  }

  public get componentInstance(): C | null {
    return this._dialogRef.componentInstance;
  }

  public close(result?: R): void {
    this._container.animatedClose(result);
  }
}
