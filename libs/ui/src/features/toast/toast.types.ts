import { color } from '../../types';

export type toastColor = color;

/**
 * Semantic intents exposed by the `ToastService` convenience methods
 * (`success` / `info` / `warning` / `danger`). Each maps to a `toastColor`
 * through the config, so a consumer can retheme what color an intent renders as.
 */
export type toastSeverity = 'success' | 'info' | 'warning' | 'danger';

/**
 * Corner of the viewport toasts are anchored to. `start`/`end` are
 * direction-aware (resolved through CSS logical properties), so they follow the
 * layout direction and flip under RTL.
 */
export type toastPosition =
  | 'top-start'
  | 'top-center'
  | 'top-end'
  | 'bottom-start'
  | 'bottom-center'
  | 'bottom-end';

/**
 * How multiple toasts are laid out.
 *
 * - `collapsed`: newest toast in front, older ones piled behind it in the z
 *   direction (scaled down and peeking); hovering or focusing the stack expands
 *   it into a full list.
 * - `expanded`: every toast is always laid out as a full vertical list.
 */
export type toastStacking = 'collapsed' | 'expanded';

/**
 * Optional action button rendered inside a toast (e.g. an "Undo"). The handler
 * runs on click; the toast dismisses itself afterwards.
 */
export type toastAction = {
  label: string;
  handler: () => void;
};
