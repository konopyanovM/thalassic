import { controlSize } from '@thalassic/ui';
import { DEFAULT_RICH_TEXT_TOOLBAR } from './rich-text-editor.constants';
import { richTextToolbarEntry, richTextToolbarItem } from './rich-text-editor.types';

/** User-facing strings rendered by the editor, overridable for localization. */
export interface RichTextEditorLabels {
  /** Accessible name for the formatting toolbar. */
  toolbar: string;
  /** Accessible name for the link URL input. */
  linkUrl: string;
  /** Placeholder shown in the link URL input. */
  linkPlaceholder: string;
  /** Label for the button that applies the link. */
  linkApply: string;
  /** Label for the button that dismisses the link editor. */
  linkCancel: string;
  /** Accessible names (and tooltips) for the toolbar controls, keyed by control. */
  controls: Record<richTextToolbarItem, string>;
}

export interface RichTextEditorConfig {
  size: controlSize;
  placeholder: string;
  fluid: boolean;
  /** Ordered toolbar layout; `separator` entries render a visual group divider. */
  toolbar: richTextToolbarEntry[];
  /** Minimum height of the editable area, expressed in rows of text. */
  minRows: number;
  /** User-facing strings, overridable for localization. */
  labels: RichTextEditorLabels;
}

/**
 * Consumer-supplied config overrides. Every field is optional, including the nested
 * `labels` (and its per-control map), so a caller can retitle a single control without
 * restating the rest.
 */
export type richTextEditorConfigOverride = Partial<Omit<RichTextEditorConfig, 'labels'>> & {
  labels?: Partial<Omit<RichTextEditorLabels, 'controls'>> & {
    controls?: Partial<Record<richTextToolbarItem, string>>;
  };
};

export const DEFAULT_RICH_TEXT_EDITOR_CONFIG: RichTextEditorConfig = {
  size: 'md',
  placeholder: '',
  fluid: false,
  toolbar: DEFAULT_RICH_TEXT_TOOLBAR,
  minRows: 4,
  labels: {
    toolbar: 'Text formatting',
    linkUrl: 'Link URL',
    linkPlaceholder: 'https://example.com',
    linkApply: 'Apply',
    linkCancel: 'Cancel',
    controls: {
      bold: 'Bold',
      italic: 'Italic',
      strikethrough: 'Strikethrough',
      code: 'Inline code',
      heading1: 'Heading 1',
      heading2: 'Heading 2',
      heading3: 'Heading 3',
      bulletList: 'Bulleted list',
      orderedList: 'Numbered list',
      blockquote: 'Quote',
      link: 'Link',
      codeBlock: 'Code block',
    },
  },
};
