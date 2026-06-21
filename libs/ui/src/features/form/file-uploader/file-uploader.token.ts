import { InjectionToken } from '@angular/core';
import { DEFAULT_FILE_UPLOADER_CONFIG, FileUploaderConfig } from './file-uploader.config';

export const FILE_UPLOADER_CONFIG = new InjectionToken<FileUploaderConfig>(
  'FILE_UPLOADER_CONFIG',
  { factory: () => DEFAULT_FILE_UPLOADER_CONFIG },
);
