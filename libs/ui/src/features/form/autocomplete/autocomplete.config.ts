import { controlSize } from '../../../types';
import { autocompleteFilterMode } from './autocomplete-filter-mode';

export interface AutocompleteConfig {
  size: controlSize;
  placeholder: string;
  fluid: boolean;
  clearable: boolean;
  filterMode: autocompleteFilterMode;
  emptyMessage: string;
  /** Accessible name for the clear button, overridable for localization. */
  clearLabel: string;
}

export const DEFAULT_AUTOCOMPLETE_CONFIG: AutocompleteConfig = {
  size: 'md',
  placeholder: '',
  fluid: false,
  clearable: false,
  filterMode: 'contains',
  emptyMessage: 'No results',
  clearLabel: 'Clear',
};
