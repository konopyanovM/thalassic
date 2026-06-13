import { controlSize } from '../../../types';

export type textareaResize = 'none' | 'both' | 'horizontal' | 'vertical';

export interface TextareaConfig {
  size: controlSize;
  placeholder: string;
  fluid: boolean;
  rows: number;
  resize: textareaResize;
}

export const DEFAULT_TEXTAREA_CONFIG: TextareaConfig = {
  size: 'md',
  placeholder: '',
  fluid: false,
  rows: 3,
  resize: 'vertical',
};
