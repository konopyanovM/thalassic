import { systemIcon } from '../icon';
import { breadcrumbsSize } from './breadcrumbs.types';

export interface BreadcrumbsConfig {
  separatorIcon: systemIcon;
  size: breadcrumbsSize;
}

export const DEFAULT_BREADCRUMBS_CONFIG: BreadcrumbsConfig = {
  separatorIcon: 'chevron-right',
  size: 'md',
};
