import { paginationSize } from './pagination.types';

export interface PaginationConfig {
  size: paginationSize;
  pageSize: number;
  boundaries: number;
  siblings: number;
  showFirstButton: boolean;
  showLastButton: boolean;
}

export const DEFAULT_PAGINATION_CONFIG: PaginationConfig = {
  size: 'md',
  pageSize: 10,
  boundaries: 1,
  siblings: 1,
  showFirstButton: false,
  showLastButton: false,
};
