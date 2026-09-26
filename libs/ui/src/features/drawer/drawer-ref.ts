import { DialogRef } from '@angular/cdk/dialog';
import { PanEvent } from '@thalassic/core';
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

  /** The id of the drawer's dialog element, for a control that points at it (`aria-controls`). */
  public get id(): string {
    return this._dialogRef.id;
  }

  public get componentInstance(): C | null {
    return this._dialogRef.componentInstance;
  }

  public close(result?: R): void {
    this._container.animatedClose(result);
  }

  /**
   * Moves a drawer opened with `openByDrag` to where the drag now puts it. The
   * event's travel is read from where the drag began, toward the drawer's open
   * position along its side's axis.
   */
  public followOpenDrag(event: PanEvent): void {
    this._container.followOpenDrag(event);
  }

  /**
   * Ends the drag a drawer opened with `openByDrag` is following: it settles
   * open when released far enough along or flicked open, and back closed —
   * then disposed — otherwise. `null` is a drag that was cancelled.
   */
  public releaseOpenDrag(event: PanEvent | null): void {
    this._container.releaseOpenDrag(event);
  }
}
