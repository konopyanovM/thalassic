import { controlSize } from '../../types';

export interface PaginationConfig {
  size: controlSize;
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
