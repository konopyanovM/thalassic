import { acceptInput } from './file-uploader.types';

export interface FileUploaderConfig {
  multiple: boolean;
  accept: acceptInput;
  fluid: boolean;
}

export const DEFAULT_FILE_UPLOADER_CONFIG: FileUploaderConfig = {
  multiple: false,
  accept: '',
  fluid: false,
};
