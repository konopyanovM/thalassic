import { InjectionToken } from '@angular/core';
import { DEFAULT_INFINITE_SCROLL_CONFIG, InfiniteScrollConfig } from './infinite-scroll.config';

export const INFINITE_SCROLL_CONFIG = new InjectionToken<InfiniteScrollConfig>(
  'INFINITE_SCROLL_CONFIG',
  { factory: () => DEFAULT_INFINITE_SCROLL_CONFIG },
);
