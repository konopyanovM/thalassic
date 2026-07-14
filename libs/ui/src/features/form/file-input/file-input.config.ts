import { controlSize } from '../../../types';
import { acceptInput, fileInputVariant } from './file-input.types';

export interface FileInputConfig {
  variant: fileInputVariant;
  size: controlSize;
  multiple: boolean;
  accept: acceptInput;
  fluid: boolean;
  hideFileList: boolean;
}

export const DEFAULT_FILE_INPUT_CONFIG: FileInputConfig = {
  variant: 'button',
  size: 'md',
  multiple: false,
  accept: '',
  fluid: false,
  hideFileList: false,
};
