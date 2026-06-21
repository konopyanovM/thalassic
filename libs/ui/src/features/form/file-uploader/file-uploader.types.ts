export type acceptInput = string | string[];

export type fileUploaderDragState = 'idle' | 'valid' | 'invalid';

export interface FileUploaderDropZoneContext {
  $implicit: fileUploaderDragState;
  accept: string;
}

export interface FileUploaderFileContext {
  $implicit: File;
  index: number;
  remove: (index: number) => void;
}
