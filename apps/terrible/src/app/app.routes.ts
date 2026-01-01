import { Route } from '@angular/router';
import { componentsRoutes } from './features/components/components.routes';
import { guideRoutes } from './features/guide/guide.routes';
import { infoRoutes } from './features/info/info.routes';

export const appRoutes: Route[] = [
  {
    path: '',
    children: infoRoutes,
  },
  {
    path: 'guide',
    children: guideRoutes,
  },
  {
    path: 'components',
    children: componentsRoutes,
  },
];
