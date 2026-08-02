import { controlSize } from '../../types';

/** Accessible names for the pagination controls, overridable for localization. */
export interface PaginationLabels {
  /** Accessible name for the first-page button. */
  first: string;
  /** Accessible name for the previous-page button. */
  previous: string;
  /** Accessible name for the next-page button. */
  next: string;
  /** Accessible name for the last-page button. */
  last: string;
  /** Accessible name for a numbered page button. */
  page: (page: number) => string;
}

export interface PaginationConfig {
  size: controlSize;
  pageSize: number;
  boundaries: number;
  siblings: number;
  showFirstButton: boolean;
  showLastButton: boolean;
  /** Accessible names for the controls, overridable for localization. */
  labels: PaginationLabels;
}

export const DEFAULT_PAGINATION_CONFIG: PaginationConfig = {
  size: 'md',
  pageSize: 10,
  boundaries: 1,
  siblings: 1,
  showFirstButton: false,
  showLastButton: false,
  labels: {
    first: 'First page',
    previous: 'Previous page',
    next: 'Next page',
    last: 'Last page',
    page: page => `Page ${page}`,
  },
};
