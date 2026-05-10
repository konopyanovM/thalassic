import { InjectionToken } from '@angular/core';
import { DEFAULT_LOADER_CONFIG, LoaderConfig } from './loader.config';

export const LOADER_CONFIG = new InjectionToken<LoaderConfig>('LOADER_CONFIG', {
  factory: () => DEFAULT_LOADER_CONFIG,
});