import { color } from '../types';

// `Record<color, true>` makes the compiler flag this list if a color token is ever added or removed.
const SEMANTIC_COLORS: Record<color, true> = {
  primary: true,
  secondary: true,
  tertiary: true,
  success: true,
  info: true,
  warning: true,
  danger: true,
};

/** Whether `value` is one of the design system's semantic color tokens (vs. a raw CSS color). */
export const isSemanticColor = (value: string): value is color =>
  Object.prototype.hasOwnProperty.call(SEMANTIC_COLORS, value);
