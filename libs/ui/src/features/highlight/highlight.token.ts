import { InjectionToken } from '@angular/core';
import { DEFAULT_HIGHLIGHT_CONFIG, HighlightConfig } from './highlight.config';

export const HIGHLIGHT_CONFIG = new InjectionToken<HighlightConfig>('HIGHLIGHT_CONFIG', {
  factory: () => DEFAULT_HIGHLIGHT_CONFIG,
});
