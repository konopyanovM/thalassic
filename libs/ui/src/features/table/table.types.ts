import { TemplateRef } from '@angular/core';
import { TrackBy } from '../../types';

export type tableColumnAlignment = 'start' | 'center' | 'end';

/**
 * What becomes of a column once the table is narrower than its collapse width.
 *
 * - `keep` — stays a column; the row still reads left to right.
 * - `fold` — leaves the column grid and reappears as a labelled line beneath
 *   the kept cells, so its value survives the loss of horizontal room.
 * - `hide` — drops out entirely, for values that are not worth vertical space.
 */
export type tableColumnCollapse = 'keep' | 'fold' | 'hide';

export type TableData = Record<string, unknown>;

export type TableTrackBy = TrackBy<TableData>;

export interface TableColumnDefinition {
  key: string;
  header?: string;
  hidden?: boolean;
  alignment?: tableColumnAlignment;
  width?: number;
  template?: TemplateRef<unknown>;
  /**
   * How this column behaves below the table's `collapseAt` width. Defaults to
   * `keep`, so a table that declares no collapse width is unaffected.
   */
  collapse?: tableColumnCollapse;
}
