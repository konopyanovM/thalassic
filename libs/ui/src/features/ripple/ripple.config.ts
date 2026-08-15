import { pointerType } from '../../types';

export interface RippleConfig {
  /**
   * Pointer types whose presses spread ink.
   *
   * Ink answers occlusion — a fingertip covers the control it spreads from, and a
   * cursor covers nothing — so a mouse is left to the press by default. Widening
   * this does not widen when ink plays: reduced motion still falls back to the
   * press whatever is listed here.
   */
  pointerTypes: pointerType[];
}

export const DEFAULT_RIPPLE_CONFIG: RippleConfig = {
  pointerTypes: ['touch', 'pen'],
};
