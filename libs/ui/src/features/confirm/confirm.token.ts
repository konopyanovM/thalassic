import { InjectionToken } from '@angular/core';
import { ConfirmConfig, DEFAULT_CONFIRM_CONFIG } from './confirm.config';

export const CONFIRM_CONFIG = new InjectionToken<ConfirmConfig>('CONFIRM_CONFIG', {
  factory: () => DEFAULT_CONFIRM_CONFIG,
});
