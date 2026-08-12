import { controlSize } from '../../../types';
import { autocompleteFilterMode } from './autocomplete-filter-mode';

export interface AutocompleteConfig {
  size: controlSize;
  placeholder: string;
  fluid: boolean;
  clearable: boolean;
  filterMode: autocompleteFilterMode;
  /** Shown in the panel when the query matched nothing, overridable for localization. */
  emptyMessage: string;
  /** Shown in the panel while a search is in flight, overridable for localization. */
  loadingMessage: string;
  /**
   * Characters the query must reach before it is emitted and before the panel shows
   * anything. `0` places no floor on it.
   */
  minQueryLength: number;
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
  loadingMessage: 'Loading',
  minQueryLength: 0,
  clearLabel: 'Clear',
  virtualScroll: false,
  // The default option row: body-medium line-height (23px) plus block padding (2 × 8px).
  virtualScrollItemSize: 39,
};
