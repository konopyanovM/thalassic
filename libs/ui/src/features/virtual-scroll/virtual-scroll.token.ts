import { InjectionToken } from '@angular/core';
import { DEFAULT_VIRTUAL_SCROLL_CONFIG, VirtualScrollConfig } from './virtual-scroll.config';

export const VIRTUAL_SCROLL_CONFIG = new InjectionToken<VirtualScrollConfig>(
  'VIRTUAL_SCROLL_CONFIG',
  { factory: () => DEFAULT_VIRTUAL_SCROLL_CONFIG },
);
