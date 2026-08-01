import { InjectionToken } from '@angular/core';
import { DEFAULT_KBD_CONFIG, KbdConfig } from './kbd.config';

export const KBD_CONFIG = new InjectionToken<KbdConfig>('KBD_CONFIG', {
  factory: () => DEFAULT_KBD_CONFIG,
});
