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

/** What a projected trigger is handed in place of the built-in button. */
export interface FileInputTriggerContext {
  /** Opens the file picker; does nothing while the control is not interactive. */
  $implicit: () => void;
  /** Whether the control is disabled or read-only, for the trigger to show it. */
  disabled: boolean;
}
