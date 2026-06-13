import { InjectionToken } from '@angular/core';
import { DEFAULT_DIALOG_CONFIG, DialogConfig } from './dialog.config';

export const DIALOG_CONFIG = new InjectionToken<DialogConfig>('DIALOG_CONFIG', {
  factory: () => DEFAULT_DIALOG_CONFIG,
});