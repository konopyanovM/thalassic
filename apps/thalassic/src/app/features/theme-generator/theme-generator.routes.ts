import { Route } from '@angular/router';

export const themeGeneratorRoutes: Route[] = [
  {
    path: '',
    loadComponent: () => import('./theme-generator').then(module => module.ThemeGenerator),
  },
];
