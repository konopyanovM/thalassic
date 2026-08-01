import { InjectionToken } from '@angular/core';
import { BreadcrumbsConfig, DEFAULT_BREADCRUMBS_CONFIG } from './breadcrumbs.config';

export const BREADCRUMBS_CONFIG = new InjectionToken<BreadcrumbsConfig>('BREADCRUMBS_CONFIG', {
  factory: () => DEFAULT_BREADCRUMBS_CONFIG,
});
