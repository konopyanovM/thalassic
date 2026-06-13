import { dialogSize } from './dialog.types';

export interface DialogConfig {
  size: dialogSize;
  closeable: boolean;
  backdropClose: boolean;
}

export const DEFAULT_DIALOG_CONFIG: DialogConfig = {
  size: 'md',
  closeable: true,
  backdropClose: true,
};