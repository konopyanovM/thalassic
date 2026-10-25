import { Option } from './option';

/** One option of an {@link OptionGroup}, with its position in the flat option list. */
export interface IndexedOption<V = unknown> {
  option: Option<V>;
  /** Position in the flat option list, which keyboard navigation and option ids index into. */
  index: number;
}

/** A run of options listed under one group heading. */
export interface OptionGroup<V = unknown> {
  /** The heading, or `null` for the options that belong to no group, which are listed bare. */
  label: string | null;
  options: IndexedOption<V>[];
}
