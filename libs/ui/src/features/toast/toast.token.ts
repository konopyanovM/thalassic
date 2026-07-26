import { InjectionToken } from '@angular/core';
import { DEFAULT_TOAST_CONFIG, ToastConfig } from './toast.config';

export const TOAST_CONFIG = new InjectionToken<ToastConfig>('TOAST_CONFIG', {
  factory: () => DEFAULT_TOAST_CONFIG,
});
