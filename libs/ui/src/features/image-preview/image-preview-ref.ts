import { DialogRef as CdkDialogRef } from '@angular/cdk/dialog';
import { map, Observable } from 'rxjs';
import { ImagePreview } from './image-preview';

/**
 * Handle to an open image preview, returned from {@link ImagePreviewService.open}.
 *
 * `close` routes through the viewer so the exit animation plays before the
 * overlay is disposed, unlike the CDK `DialogRef` which disposes synchronously.
 */
export class ImagePreviewRef {
  public readonly closed: Observable<void>;

  constructor(private readonly _cdkRef: CdkDialogRef<void, ImagePreview>) {
    this.closed = _cdkRef.closed.pipe(map(() => undefined));
  }

  /** Index of the image currently on screen; `-1` once the preview has closed. */
  public get index(): number {
    const viewer = this._cdkRef.componentInstance;
    if (!viewer) return -1;

    return viewer.index();
  }

  public close(): void {
    const viewer = this._cdkRef.componentInstance;
    if (!viewer) {
      this._cdkRef.close();
      return;
    }

    viewer.animatedClose();
  }

  /** Shows the image at `index`, wrapping around when the preview loops. */
  public goTo(index: number): void {
    const viewer = this._cdkRef.componentInstance;
    if (!viewer) return;

    viewer.goTo(index);
  }
}
