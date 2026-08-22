import { InjectionToken } from '@angular/core';
import { DEFAULT_SWIPE_ACTIONS_CONFIG, SwipeActionsConfig } from './swipe-actions.config';

export const SWIPE_ACTIONS_CONFIG = new InjectionToken<SwipeActionsConfig>(
  'SWIPE_ACTIONS_CONFIG',
  { factory: () => DEFAULT_SWIPE_ACTIONS_CONFIG },
);
