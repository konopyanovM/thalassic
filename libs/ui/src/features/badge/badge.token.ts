import { InjectionToken } from '@angular/core';
import { BadgeConfig, DEFAULT_BADGE_CONFIG } from './badge.config';

export const BADGE_CONFIG = new InjectionToken<BadgeConfig>('BADGE_CONFIG', {
  factory: () => DEFAULT_BADGE_CONFIG,
});
