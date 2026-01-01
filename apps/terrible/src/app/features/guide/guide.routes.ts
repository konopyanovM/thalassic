import { Route } from '@angular/router';

export const guideRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./guide').then(c => c.Guide),
  },
];
