import {
  EnvironmentProviders,
  inject,
  makeEnvironmentProviders,
  provideEnvironmentInitializer,
} from '@angular/core';
import { ViewportService } from '../features';
import { DEFAULT_VIEWPORT_CONFIG, ViewportConfig } from '../features/viewport/viewport.config';
import { VIEWPORT_CONFIG } from '../features/viewport/viewport.token';

export const provideViewport = (config?: Partial<ViewportConfig>): EnvironmentProviders => {
  return makeEnvironmentProviders([
    { provide: VIEWPORT_CONFIG, useValue: { ...DEFAULT_VIEWPORT_CONFIG, ...config } },
    ViewportService,
    provideEnvironmentInitializer(() => inject(ViewportService)),
  ]);
};
