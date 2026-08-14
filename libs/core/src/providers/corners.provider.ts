import {
  DOCUMENT,
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer
} from '@angular/core';
import { cornerStyle } from '../types';

/**
 * Selects the corner curvature the design system draws on its controls,
 * reflected onto the document root as `data-corners` for the theme stylesheets
 * to key off. Plain circular rounding is the default; `'squircle'` opts the
 * whole app into the continuous curve wherever the browser can draw it —
 * elsewhere the circular corners stand regardless of the choice.
 */
export const provideCorners = (corners: cornerStyle): EnvironmentProviders => {
  return makeEnvironmentProviders([
    provideEnvironmentInitializer(() => {
      inject(DOCUMENT).documentElement.setAttribute('data-corners', corners);
    }),
  ]);
};
