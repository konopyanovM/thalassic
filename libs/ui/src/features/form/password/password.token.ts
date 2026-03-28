import { InjectionToken } from '@angular/core';
import { DEFAULT_PASSWORD_CONFIG, PasswordConfig } from './password.config';

export const PASSWORD_CONFIG = new InjectionToken<PasswordConfig>('PASSWORD_CONFIG', {
  factory: () => DEFAULT_PASSWORD_CONFIG,
});
