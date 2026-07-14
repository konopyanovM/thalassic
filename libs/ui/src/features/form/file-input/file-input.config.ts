import { acceptInput, fileInputVariant } from './file-input.types';

export interface FileInputConfig {
  variant: fileInputVariant;
  multiple: boolean;
  accept: acceptInput;
  fluid: boolean;
}

export const DEFAULT_FILE_INPUT_CONFIG: FileInputConfig = {
  variant: 'button',
  multiple: false,
  accept: '',
  fluid: false,
};
