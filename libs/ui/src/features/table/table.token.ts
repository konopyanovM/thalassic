import { InjectionToken } from '@angular/core';
import { DEFAULT_TABLE_CONFIG, TableConfig } from './table.config';

export const TABLE_CONFIG = new InjectionToken<TableConfig>('TABLE_CONFIG', {
  factory: () => DEFAULT_TABLE_CONFIG,
});