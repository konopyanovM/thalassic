import { dialogFooterAlign, dialogSize } from './dialog.types';

export interface DialogConfig {
  size: dialogSize;
  closeable: boolean;
  backdropClose: boolean;
  /** Accessible name for the close button, overridable for localization. */
  closeLabel: string;
  /** Alignment `tls-dialog-footer` falls back to when it sets none itself. */
  footerAlign: dialogFooterAlign;
}

export const DEFAULT_DIALOG_CONFIG: DialogConfig = {
  size: 'md',
  closeable: true,
  backdropClose: true,
  closeLabel: 'Close dialog',
  footerAlign: 'end',
};