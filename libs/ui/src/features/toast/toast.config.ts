import { toastColor, toastPosition, toastSeverity, toastStacking } from './toast.types';

export interface ToastConfig {
  /** Corner of the viewport toasts are anchored to. */
  position: toastPosition;
  /** Layout of multiple toasts: a hover-to-expand pile, or an always-open list. */
  stacking: toastStacking;
  /** Auto-dismiss delay in milliseconds. `0` keeps the toast until dismissed explicitly. */
  duration: number;
  /** Maximum number of toasts kept at once; showing more dismisses the oldest. */
  max: number;
  /** Default color when a toast does not specify one. */
  color: toastColor;
  /** Color each semantic convenience method (`success`/`info`/`warning`/`danger`) renders as. */
  severityColors: Record<toastSeverity, toastColor>;
  /** Whether toasts render a close button by default. */
  closable: boolean;
  /** Whether toasts render a leading, color-coded status icon by default. */
  showIcon: boolean;
  /** Whether auto-dismissing toasts render a countdown progress bar of their remaining time. */
  showProgress: boolean;
  /** Whether hovering / focusing the stack pauses every toast's auto-dismiss timer. */
  pauseOnHover: boolean;
  /** Accessible name for the toast region landmark, overridable for localization. */
  regionLabel: string;
  /** Accessible name for a toast's close button, overridable for localization. */
  dismissLabel: string;
}

export const DEFAULT_TOAST_CONFIG: ToastConfig = {
  position: 'top-end',
  stacking: 'collapsed',
  duration: 5000,
  max: 5,
  color: 'primary',
  severityColors: {
    success: 'success',
    info: 'info',
    warning: 'warning',
    danger: 'danger',
  },
  closable: true,
  showIcon: true,
  showProgress: true,
  pauseOnHover: true,
  regionLabel: 'Notifications',
  dismissLabel: 'Dismiss',
};
