export interface ImagePreviewLabels {
  /** Accessible name of the viewer surface itself. */
  title: string;
  close: string;
  previous: string;
  next: string;
  zoomIn: string;
  zoomOut: string;
  resetZoom: string;
  /** Position within the group. `{index}` and `{total}` are substituted. */
  counter: string;
  /** Shown in place of the image when it fails to load. */
  error: string;
}

export interface ImagePreviewConfig {
  /** Whether a close button is rendered. */
  closeable: boolean;
  /** Whether a click on the scrim around the image dismisses the viewer. */
  backdropClose: boolean;
  /**
   * Dismisses the viewer on Escape. Independent of {@link ImagePreviewConfig.backdropClose}:
   * a surface that ignores scrim clicks still owes keyboard users a way out.
   */
  escapeClose: boolean;
  /** Whether the image can be zoomed and panned, and the zoom controls are rendered. */
  zoomable: boolean;
  /** Lower zoom bound. The viewer opens and resets at `1`, the fit to the viewport. */
  minZoom: number;
  maxZoom: number;
  /** Factor the zoom is multiplied by per control press or keyboard step. */
  zoomStep: number;
  /** Zoom level a double-click or double-tap toggles to. */
  doubleClickZoom: number;
  /** Whether navigation wraps around at both ends of a group. */
  loop: boolean;
  /** Whether the position within a group is displayed. Groups of one show nothing regardless. */
  showCounter: boolean;
  labels: ImagePreviewLabels;
}

export const DEFAULT_IMAGE_PREVIEW_CONFIG: ImagePreviewConfig = {
  closeable: true,
  backdropClose: true,
  escapeClose: true,
  zoomable: true,
  minZoom: 1,
  maxZoom: 5,
  zoomStep: 1.5,
  doubleClickZoom: 2,
  loop: true,
  showCounter: true,
  labels: {
    title: 'Image preview',
    close: 'Close image preview',
    previous: 'Previous image',
    next: 'Next image',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    resetZoom: 'Reset zoom',
    counter: '{index} / {total}',
    error: 'The image could not be loaded',
  },
};
