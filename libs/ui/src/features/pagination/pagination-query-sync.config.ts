export interface PaginationQuerySyncConfig {
  paramKey: string;
}

export const DEFAULT_PAGINATION_QUERY_SYNC_CONFIG: PaginationQuerySyncConfig = {
  paramKey: 'page',
};
