import { richTextToolbarEntry } from './rich-text-editor.types';

/**
 * Whether the runtime is an Apple platform, where shortcuts are shown with the ⌘ symbol
 * (matching ProseMirror's `Mod-` resolution to Cmd there and Ctrl elsewhere).
 */
export const IS_APPLE_PLATFORM: boolean =
  typeof navigator !== 'undefined' && /Mac|iPhone|iPad|iPod/.test(navigator.platform);

/** Matches a URL scheme prefix (`https:`, `javascript:`, …) at the start of an href. */
export const LINK_SCHEME_REGEX = /^[a-z][a-z0-9+.-]*:/i;

/**
 * Schemes a link href may carry. Anything else (`javascript:`, `data:`, …) is rejected
 * so a crafted URL cannot smuggle an executable payload into the emitted Markdown;
 * scheme-less hrefs (relative paths, `#anchors`) are always allowed.
 */
export const SAFE_LINK_SCHEMES: readonly string[] = ['http:', 'https:', 'mailto:', 'tel:'];

/** The default toolbar layout, grouped by kind with `separator` entries between groups. */
export const DEFAULT_RICH_TEXT_TOOLBAR: richTextToolbarEntry[] = [
  'bold',
  'italic',
  'strikethrough',
  'code',
  'separator',
  'heading1',
  'heading2',
  'heading3',
  'separator',
  'bulletList',
  'orderedList',
  'blockquote',
  'separator',
  'link',
  'codeBlock',
];
