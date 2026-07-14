import { InjectionToken } from '@angular/core';
import { DEFAULT_FILE_INPUT_CONFIG, FileInputConfig } from './file-input.config';

export const FILE_INPUT_CONFIG = new InjectionToken<FileInputConfig>('FILE_INPUT_CONFIG', {
  factory: () => DEFAULT_FILE_INPUT_CONFIG,
});
