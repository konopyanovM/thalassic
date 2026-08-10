import { controlSize } from '../../../types';
import { acceptInput } from '../file-drop-target';
import { fileInputVariant } from './file-input.types';

export interface FileInputConfig {
  variant: fileInputVariant;
  size: controlSize;
  multiple: boolean;
  accept: acceptInput;
  fluid: boolean;
  hideFileList: boolean;
  /** Trigger label in single-file mode, overridable for localization. */
  chooseFileLabel: string;
  /** Trigger label in multiple-file mode, overridable for localization. */
  chooseFilesLabel: string;
  /** Fallback accessible name for the drop zone in single-file mode, overridable for localization. */
  dropZoneFileLabel: string;
  /** Fallback accessible name for the drop zone in multiple-file mode, overridable for localization. */
  dropZoneFilesLabel: string;
}

export const DEFAULT_FILE_INPUT_CONFIG: FileInputConfig = {
  variant: 'button',
  size: 'md',
  multiple: false,
  accept: '',
  fluid: false,
  hideFileList: false,
  chooseFileLabel: 'Choose file',
  chooseFilesLabel: 'Choose files',
  dropZoneFileLabel: 'Upload file',
  dropZoneFilesLabel: 'Upload files',
};
