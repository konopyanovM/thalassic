import { imageCompareOrientation } from './image-compare.types';

export interface ImageCompareConfig {
  orientation: imageCompareOrientation;
  /** Initial divider position as a percentage (0–100) from the layout-start edge. */
  position: number;
  /** Percentage the divider moves per arrow-key press. */
  keyboardStep: number;
}

export const DEFAULT_IMAGE_COMPARE_CONFIG: ImageCompareConfig = {
  orientation: 'horizontal',
  position: 50,
  keyboardStep: 5,
};
