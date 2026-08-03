import { InjectionToken } from '@angular/core';
import { DEFAULT_RICH_TEXT_EDITOR_CONFIG, RichTextEditorConfig } from './rich-text-editor.config';

export const RICH_TEXT_EDITOR_CONFIG = new InjectionToken<RichTextEditorConfig>(
  'RICH_TEXT_EDITOR_CONFIG',
  {
    factory: () => DEFAULT_RICH_TEXT_EDITOR_CONFIG,
  },
);
