import { Route } from '@angular/router';

export const componentsRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./components').then(c => c.Components),
  },
];
