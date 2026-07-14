export type acceptInput = string | string[];

export type fileInputVariant = 'dropzone' | 'button';

export type fileInputDragState = 'idle' | 'valid' | 'invalid';

export interface FileInputDropZoneContext {
  $implicit: fileInputDragState;
  accept: string;
}

export interface FileInputFileContext {
  $implicit: File;
  index: number;
  remove: (index: number) => void;
}
