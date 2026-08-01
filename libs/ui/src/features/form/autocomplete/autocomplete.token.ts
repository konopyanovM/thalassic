import { InjectionToken } from '@angular/core';
import { AutocompleteConfig, DEFAULT_AUTOCOMPLETE_CONFIG } from './autocomplete.config';

export const AUTOCOMPLETE_CONFIG = new InjectionToken<AutocompleteConfig>('AUTOCOMPLETE_CONFIG', {
  factory: () => DEFAULT_AUTOCOMPLETE_CONFIG,
});
