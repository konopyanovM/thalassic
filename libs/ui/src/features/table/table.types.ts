import { TemplateRef, TrackByFunction } from '@angular/core';

export type tableColumnAlignment = 'start' | 'center' | 'end';

export type TableData = Record<string, unknown>;

export type TableTrackBy = string | TrackByFunction<TableData>;

export interface TableColumnDefinition {
  key: string;
  header?: string;
  hidden?: boolean;
  alignment?: tableColumnAlignment;
  width?: number;
  template?: TemplateRef<unknown>;
}
