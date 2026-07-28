import { InjectionToken } from '@angular/core';
import { DEFAULT_SPLITTER_CONFIG, SplitterConfig } from './splitter.config';

export const SPLITTER_CONFIG = new InjectionToken<SplitterConfig>('SPLITTER_CONFIG', {
  factory: () => DEFAULT_SPLITTER_CONFIG,
});
