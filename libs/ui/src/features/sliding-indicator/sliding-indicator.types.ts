import { orientation } from '../../types';

/**
 * What an indicator is kept on. Each is read where signals are tracked, so the
 * indicator follows whatever state the answers are derived from.
 */
export interface SlidingIndicatorOptions {
  /**
   * The element the items are laid out in and the indicator is drawn on. It
   * must be positioned, which the theme's `sliding-indicator` mixin sees to.
   */
  container: () => HTMLElement | null | undefined;
  /**
   * The chosen item, or nothing wherever no single indicator applies — nothing
   * chosen, several chosen, a treatment that marks its items another way.
   */
  target: () => HTMLElement | null | undefined;
  /** The axis the items run along, which decides whether the indicator is used at all. */
  orientation: () => orientation;
}

/** An item's box within its container: its offset from the padding edge, and its size. */
export interface SlidingIndicatorBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** A chosen item as it was found laid out, and the container it was found in. */
export interface SlidingIndicatorMeasurement {
  container: HTMLElement;
  target: HTMLElement;
  box: SlidingIndicatorBox;
}
