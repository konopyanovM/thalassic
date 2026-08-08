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
  /** Renders the panel through a virtual-scroll viewport, windowing the option list. */
  virtualScroll: boolean;
  /** Fixed height of an option row, in pixels, when the panel is virtualized. */
  virtualScrollItemSize: number;
}

export const DEFAULT_AUTOCOMPLETE_CONFIG: AutocompleteConfig = {
  size: 'md',
  placeholder: '',
  fluid: false,
  clearable: false,
  filterMode: 'contains',
  emptyMessage: 'No results',
  clearLabel: 'Clear',
  virtualScroll: false,
  // The default option row: body-medium line-height (23px) plus block padding (2 × 8px).
  virtualScrollItemSize: 39,
};
