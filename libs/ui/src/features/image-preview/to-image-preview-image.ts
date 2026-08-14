import { ImagePreviewImage, ImagePreviewSource } from './image-preview.types';

/** Normalizes an image given as a bare URL into the descriptor shape. */
export function toImagePreviewImage(source: ImagePreviewSource): ImagePreviewImage {
  if (typeof source === 'string') return { src: source };
  return source;
}
