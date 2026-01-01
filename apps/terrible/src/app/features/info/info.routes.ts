import { Route } from '@angular/router';

export const infoRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./info').then(c => c.Info),
  },
];
