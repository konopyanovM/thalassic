import { controlSize } from '../../types';
import { buttonColor, buttonVariant } from '../button/button.types';

/**
 * Appearance of one of the confirm dialog's action buttons. Mirrors the
 * `tls-button` inputs; every field but `label` is optional and falls back to
 * the confirm config default, then to the button's own default. The action is
 * fixed (resolve or reject the confirmation), so no click handler is exposed —
 * only presentation is configurable.
 */
export type confirmButton = {
  label: string;
  color?: buttonColor;
  variant?: buttonVariant;
  size?: controlSize;
  icon?: boolean;
  rounded?: boolean;
  fluid?: boolean;
  disabled?: boolean;
};

/** A {@link confirmButton} with every appearance field resolved to a concrete value. */
export type resolvedConfirmButton = Required<confirmButton>;

/**
 * Width step of a confirm dialog, mapped onto its max-width. `md` is the
 * default, so the scale opens in both directions rather than only upward. It
 * runs narrower than `dialogSize` throughout and stops at `lg`: a confirmation
 * is a question and two buttons, and anything wider is a dialog.
 */
export type confirmSize = 'sm' | 'md' | 'lg';

/**
 * Horizontal alignment of the cancel / confirm action buttons within the dialog,
 * mapped onto `justify-content` (direction-aware: `start`/`end` follow the
 * layout direction).
 */
export type confirmActionsAlign = 'start' | 'center' | 'end' | 'space-between';
