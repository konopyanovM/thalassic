import { Dialog as CdkDialog } from '@angular/cdk/dialog';
import { inject, Injectable } from '@angular/core';
import { ImagePreview } from './image-preview';
import { ImagePreviewConfig, ImagePreviewLabels } from './image-preview.config';
import { IMAGE_PREVIEW_CONFIG } from './image-preview.token';
import { ImagePreviewData, ImagePreviewSource } from './image-preview.types';
import { ImagePreviewRef } from './image-preview-ref';
import { toImagePreviewImage } from './to-image-preview-image';

export interface ImagePreviewOpenConfig extends Partial<Omit<ImagePreviewConfig, 'labels'>> {
  /** One image or the gallery to page through. */
  images: ImagePreviewSource | ImagePreviewSource[];
  /** Index of the image shown first, clamped to the list. */
  startIndex?: number;
  labels?: Partial<ImagePreviewLabels>;
  /** Accessible name of the viewer surface, overriding the configured title. */
  ariaLabel?: string;
}

@Injectable({ providedIn: 'root' })
export class ImagePreviewService {
  // Injections
  private readonly _dialog = inject(CdkDialog);
  private readonly _config = inject(IMAGE_PREVIEW_CONFIG);

  // State
  // Open previews, tracked so `closeAll` can play each exit animation and so it
  // closes previews only (the CDK `Dialog` is shared with other surfaces).
  private readonly _openPreviews = new Set<ImagePreviewRef>();

  // Public methods
  public open(config: ImagePreviewOpenConfig): ImagePreviewRef {
    const resolvedConfig = this._resolveConfig(config);
    const data = this._resolveData(config);

    const cdkRef = this._dialog.open<void, ImagePreviewData, ImagePreview>(ImagePreview, {
      data,
      providers: () => [{ provide: IMAGE_PREVIEW_CONFIG, useValue: resolvedConfig }],
      // The viewer paints its own full-screen scrim and dismisses on a click
      // outside the image, so a separate backdrop element would only sit under it.
      hasBackdrop: false,
      panelClass: 'tls-image-preview-pane',
      // Suppress CDK's synchronous auto-close so every dismissal routes through
      // the viewer, which plays the exit animation before disposal.
      disableClose: true,
      // Focus the viewer itself rather than its first control: the surface owns the
      // keyboard shortcuts, and no single control deserves the initial focus ring.
      autoFocus: 'tls-image-preview',
      ariaModal: true,
      ariaLabel: config.ariaLabel ?? resolvedConfig.labels.title,
    });

    const previewRef = new ImagePreviewRef(cdkRef);

    this._openPreviews.add(previewRef);
    cdkRef.closed.subscribe(() => this._openPreviews.delete(previewRef));

    return previewRef;
  }

  public closeAll(): void {
    // Iterating a snapshot: `close` is animated, so removal happens later (on
    // `closed`), but guard against any synchronous mutation regardless.
    for (const previewRef of [...this._openPreviews]) previewRef.close();
  }

  // Private methods
  private _resolveConfig(config: ImagePreviewOpenConfig): ImagePreviewConfig {
    return {
      closeable: config.closeable ?? this._config.closeable,
      backdropClose: config.backdropClose ?? this._config.backdropClose,
      escapeClose: config.escapeClose ?? this._config.escapeClose,
      zoomable: config.zoomable ?? this._config.zoomable,
      minZoom: config.minZoom ?? this._config.minZoom,
      maxZoom: config.maxZoom ?? this._config.maxZoom,
      zoomStep: config.zoomStep ?? this._config.zoomStep,
      doubleClickZoom: config.doubleClickZoom ?? this._config.doubleClickZoom,
      loop: config.loop ?? this._config.loop,
      showCounter: config.showCounter ?? this._config.showCounter,
      labels: { ...this._config.labels, ...config.labels },
    };
  }

  private _resolveData(config: ImagePreviewOpenConfig): ImagePreviewData {
    const sources = Array.isArray(config.images) ? config.images : [config.images];
    // A source without a URL has nothing to show, and an empty list leaves the
    // viewer with no image at all — a caller mistake worth naming on the spot
    // rather than letting the surface open onto nothing.
    const images = sources.map(toImagePreviewImage).filter(image => Boolean(image.src));
    if (images.length === 0) {
      throw new Error('ImagePreviewService.open requires at least one image with a `src`.');
    }

    const startIndex = config.startIndex ?? 0;

    return {
      images,
      startIndex: Math.min(Math.max(0, startIndex), images.length - 1),
    };
  }
}
