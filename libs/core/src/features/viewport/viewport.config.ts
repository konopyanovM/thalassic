import { breakpoint } from './types';

export interface ViewportConfig {
  /**
   * `max-width` threshold in pixels for each named breakpoint. Values must stay
   * in sync with the SCSS breakpoints in
   * `libs/core/src/styles/tools/_breakpoint.scss` so TypeScript branching and CSS
   * media queries flip at the same widths.
   */
  breakpoints: Record<breakpoint, number>;
}

export const DEFAULT_VIEWPORT_CONFIG: ViewportConfig = {
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
};
