import { splitterOrientation } from './splitter.types';

export interface SplitterConfig {
  orientation: splitterOrientation;
  /** Percentage a gutter moves per arrow-key press. */
  keyboardStep: number;
}

export const DEFAULT_SPLITTER_CONFIG: SplitterConfig = {
  orientation: 'horizontal',
  keyboardStep: 5,
};
