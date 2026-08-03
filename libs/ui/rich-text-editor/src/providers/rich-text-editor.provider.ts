import { EnvironmentProviders, makeEnvironmentProviders } from '@angular/core';
import { deepMerge } from '@thalassic/core';
import {
  DEFAULT_RICH_TEXT_EDITOR_CONFIG,
  RICH_TEXT_EDITOR_CONFIG,
  RichTextEditorConfig,
  richTextEditorConfigOverride,
} from '../features/rich-text-editor';

export const provideThalassicRichTextEditorConfig = (
  config: richTextEditorConfigOverride,
): EnvironmentProviders => {
  return makeEnvironmentProviders([
    {
      provide: RICH_TEXT_EDITOR_CONFIG,
      // `labels` is a deep-partial override; deepMerge merges it recursively, but its
      // `Partial<T>` signature only models a shallow partial, so cast to it.
      useValue: deepMerge(DEFAULT_RICH_TEXT_EDITOR_CONFIG, config as Partial<RichTextEditorConfig>),
    },
  ]);
};
