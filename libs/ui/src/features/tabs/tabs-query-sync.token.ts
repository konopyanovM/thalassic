import { InjectionToken } from '@angular/core';
import { DEFAULT_TABS_QUERY_SYNC_CONFIG, TabsQuerySyncConfig } from './tabs-query-sync.config';

export const TABS_QUERY_SYNC_CONFIG = new InjectionToken<TabsQuerySyncConfig>('TABS_QUERY_SYNC_CONFIG', {
  factory: () => DEFAULT_TABS_QUERY_SYNC_CONFIG,
});
