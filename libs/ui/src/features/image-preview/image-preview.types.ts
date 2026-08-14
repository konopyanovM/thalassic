/** One image shown by the preview viewer. */
export interface ImagePreviewImage {
  /** URL of the full-size image the viewer renders. */
  src: string;
  /** Alternative text announced for the image. */
  alt?: string;
  /** Caption displayed beneath the image. */
  caption?: string;
}

/** An image given either as a bare URL or as a full descriptor. */
export type ImagePreviewSource = string | ImagePreviewImage;

/** Payload the viewer surface is opened with. */
export interface ImagePreviewData {
  images: ImagePreviewImage[];
  /** Index of the image shown first, already clamped to the list. */
  startIndex: number;
}

/**
 * A member of a preview group: an element that contributes one image to the
 * group's list and can be located within it. Implemented by the trigger
 * directive so the group holds no dependency on it.
 */
export interface ImagePreviewGroupItem {
  /** Host element, used to order the group's images by document position. */
  readonly element: HTMLElement;
  /** The image this member contributes; an empty `src` excludes it. */
  resolveImage(): ImagePreviewImage;
}
