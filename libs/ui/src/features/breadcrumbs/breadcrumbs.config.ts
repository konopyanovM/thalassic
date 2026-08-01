import { systemIcon } from '../icon';

export interface BreadcrumbsConfig {
  separatorIcon: systemIcon;
}

export const DEFAULT_BREADCRUMBS_CONFIG: BreadcrumbsConfig = {
  separatorIcon: 'chevron-right',
};
