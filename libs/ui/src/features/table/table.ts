import {
  CdkCell,
  CdkCellDef,
  CdkColumnDef,
  CdkHeaderCell,
  CdkHeaderCellDef,
  CdkHeaderRow,
  CdkHeaderRowDef,
  CdkRow,
  CdkRowDef,
  CdkTable,
  DataSource,
} from '@angular/cdk/table';
import { NgTemplateOutlet } from '@angular/common';
import {
  booleanAttribute,
  Component,
  computed,
  contentChildren,
  inject,
  input,
  InputSignal,
  InputSignalWithTransform,
  TrackByFunction,
} from '@angular/core';
import { toObservable } from '@angular/core/rxjs-interop';
import { resolveTrackBy } from '../../utils';
import { TableColumn } from './table-column';
import { TableConfig } from './table.config';
import { TABLE_CONFIG } from './table.token';
import { TableColumnDefinition, TableData, TableTrackBy } from './table.types';

@Component({
  selector: 'tls-table',
  imports: [
    CdkTable,
    CdkHeaderCell,
    CdkCell,
    CdkCellDef,
    CdkHeaderCellDef,
    CdkColumnDef,
    CdkHeaderRow,
    CdkHeaderRowDef,
    CdkRow,
    CdkRowDef,
    NgTemplateOutlet,
  ],
  templateUrl: './table.html',
  styleUrl: './table.scss',
  host: {},
})
export class Table {
  private readonly _config = inject<TableConfig>(TABLE_CONFIG);

  public readonly data: InputSignal<TableData[]> = input.required();
  public readonly columnDefinitions: InputSignal<TableColumnDefinition[]> = input<
    TableColumnDefinition[]
  >([]);
  public readonly hideHeader: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.hideHeader,
    { transform: booleanAttribute },
  );
  public readonly striped: InputSignalWithTransform<boolean, unknown> = input<boolean, unknown>(
    this._config.striped,
    { transform: booleanAttribute },
  );
  public readonly trackBy = input<TableTrackBy>();

  /** Accessible name for the table, forwarded to the inner `<table>` element. */
  public readonly ariaLabel = input<string | undefined>(undefined);
  public readonly ariaLabelledby = input<string | undefined>(undefined);

  protected readonly tableColumns = contentChildren(TableColumn);

  // Merges columnDefinitions input and tls-table-column content children into a single list.
  // Input drives order; content children override matching keys and append unmatched columns at the end.
  // Map keyed by content column key → O(1) lookup when applying overrides to each input column.
  // Set of input keys → O(1) membership check when finding content columns absent from input (extras).
  // extras: content columns with no matching input entry, appended after the merged input columns.
  protected readonly effectiveColumnDefinitions = computed<TableColumnDefinition[]>(() => {
    const fromContent = this._mapContentColumns(this.tableColumns());
    const fromInput = this.columnDefinitions();

    if (fromContent.length === 0) return fromInput;
    if (fromInput.length === 0) return fromContent;

    const contentByKey = new Map(fromContent.map(definition => [definition.key, definition]));
    const inputKeys = new Set(fromInput.map(definition => definition.key));

    const merged = fromInput.map(definition => ({
      ...definition,
      ...(contentByKey.get(definition.key) ?? {}),
    }));
    const extras = fromContent.filter(definition => !inputKeys.has(definition.key));

    return [...merged, ...extras];
  });

  protected readonly columns = computed(() =>
    this.effectiveColumnDefinitions().reduce(
      (filtered: string[], columnDefinition: TableColumnDefinition) => {
        if (!columnDefinition.hidden) filtered.push(columnDefinition.key);
        return filtered;
      },
      [],
    ),
  );

  protected readonly resolvedTrackBy = computed<TrackByFunction<TableData>>(() =>
    resolveTrackBy(this.trackBy()),
  );

  protected readonly classes = computed(() => {
    const className = 'tls-table';

    const array: string[] = [className];
    if (this.hideHeader()) array.push(`${className}--hide-header`);
    if (this.striped()) array.push(`${className}--striped`);

    return array;
  });

  protected readonly dataSource: DataSource<TableData> = {
    connect: () => {
      return toObservable(this.data);
    },
    disconnect: () => {
      // no operation
    },
  };

  // Private methods
  private _mapContentColumns(columns: readonly TableColumn[]): TableColumnDefinition[] {
    return columns.map((column): TableColumnDefinition => this._mapContentColumn(column));
  }

  private _mapContentColumn(column: TableColumn): TableColumnDefinition {
    const definition: TableColumnDefinition = { key: column.key(), hidden: column.hidden() };

    const header = column.header();
    if (header !== undefined) definition.header = header;

    const alignment = column.alignment();
    if (alignment !== undefined) definition.alignment = alignment;

    const width = column.width();
    if (width !== undefined) definition.width = width;

    const template = column.template();
    if (template !== undefined) definition.template = template;

    return definition;
  }
}
