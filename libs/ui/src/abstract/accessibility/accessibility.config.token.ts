import { InjectionToken } from '@angular/core';
import { AccessibilityConfig, DEFAULT_ACCESSIBILITY_CONFIG } from './accessibility.config';

export const ACCESSIBILITY_CONFIG = new InjectionToken<AccessibilityConfig>('ACCESSIBILITY_CONFIG', {
  factory: () => DEFAULT_ACCESSIBILITY_CONFIG,
});
