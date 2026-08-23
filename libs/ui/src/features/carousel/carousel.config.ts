/** Accessible names for the carousel controls, overridable for localization. */
export interface CarouselLabels {
  /** Accessible name for the previous-slide button. */
  previous: string;
  /** Accessible name for the next-slide button. */
  next: string;
  /** Accessible name for the rotation toggle while rotation is stopped. */
  play: string;
  /** Accessible name for the rotation toggle while rotation is running. */
  pause: string;
  /**
   * Accessible name for a slide, from its 1-based position, the slide count and
   * the slide's own `label` when it sets one.
   */
  slide: (index: number, count: number, label: string | undefined) => string;
  /** Accessible name for an indicator dot, from its slide's 1-based position. */
  goToSlide: (index: number) => string;
}

export interface CarouselConfig {
  /** Whether the previous/next controls (and swipes) wrap around at the ends. */
  loop: boolean;
  /**
   * Milliseconds between automatic slide advances; 0 disables auto-rotation.
   * Rotation always wraps past the last slide whatever `loop` says — rotation
   * that stalls at the end would leave the stop control describing motion that
   * is no longer happening.
   */
  autoplayInterval: number;
  showArrows: boolean;
  showIndicators: boolean;
  /** Accessible names for the controls, overridable for localization. */
  labels: CarouselLabels;
}

export const DEFAULT_CAROUSEL_CONFIG: CarouselConfig = {
  loop: false,
  autoplayInterval: 0,
  showArrows: true,
  showIndicators: true,
  labels: {
    previous: 'Previous slide',
    next: 'Next slide',
    play: 'Start slide rotation',
    pause: 'Stop slide rotation',
    slide: (index, count, label) =>
      label === undefined ? `${index} of ${count}` : `${label}, ${index} of ${count}`,
    goToSlide: index => `Go to slide ${index}`,
  },
};
