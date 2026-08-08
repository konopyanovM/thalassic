import { TemplateRef } from '@angular/core';
import { TrackBy } from '../../types';

export type tableColumnAlignment = 'start' | 'center' | 'end';

export type TableData = Record<string, unknown>;

export type TableTrackBy = TrackBy<TableData>;

export interface TableColumnDefinition {
  key: string;
  header?: string;
  hidden?: boolean;
  alignment?: tableColumnAlignment;
  width?: number;
  template?: TemplateRef<unknown>;
}
