import { InjectionToken } from '@angular/core';
import {
  DEFAULT_PAGINATION_QUERY_SYNC_CONFIG,
  PaginationQuerySyncConfig,
} from './pagination-query-sync.config';

export const PAGINATION_QUERY_SYNC_CONFIG = new InjectionToken<PaginationQuerySyncConfig>(
  'PAGINATION_QUERY_SYNC_CONFIG',
  { factory: () => DEFAULT_PAGINATION_QUERY_SYNC_CONFIG },
);
