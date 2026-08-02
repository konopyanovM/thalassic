import { dialogSize } from './dialog.types';

export interface DialogConfig {
  size: dialogSize;
  closeable: boolean;
  backdropClose: boolean;
  /** Accessible name for the close button, overridable for localization. */
  closeLabel: string;
}

export const DEFAULT_DIALOG_CONFIG: DialogConfig = {
  size: 'md',
  closeable: true,
  backdropClose: true,
  closeLabel: 'Close dialog',
};