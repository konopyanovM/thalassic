import { fileDragState } from '../file-drop-target';

export type fileInputVariant = 'dropzone' | 'button';

export interface FileInputDropZoneContext {
  $implicit: fileDragState;
  accept: string;
}

export interface FileInputFileContext {
  $implicit: File;
  index: number;
  remove: (index: number) => void;
}
