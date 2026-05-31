import { InjectionToken } from '@angular/core';
import { DEFAULT_PAGINATION_CONFIG, PaginationConfig } from './pagination.config';

export const PAGINATION_CONFIG = new InjectionToken<PaginationConfig>('PAGINATION_CONFIG', {
  factory: () => DEFAULT_PAGINATION_CONFIG,
});