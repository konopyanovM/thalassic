import { Command, EditorState } from 'prosemirror-state';
import { systemIcon } from '@thalassic/ui';

/** A single formatting control that can appear in the editor toolbar. */
export type richTextToolbarItem =
  | 'bold'
  | 'italic'
  | 'strikethrough'
  | 'code'
  | 'heading1'
  | 'heading2'
  | 'heading3'
  | 'bulletList'
  | 'orderedList'
  | 'blockquote'
  | 'link'
  | 'codeBlock';

/** A toolbar entry: either a formatting control or a visual group separator. */
export type richTextToolbarEntry = richTextToolbarItem | 'separator';

/** Runtime description of a toolbar control, resolved against the editor schema. */
export interface RichTextToolbarButton {
  id: richTextToolbarItem;
  /** Accessible name and tooltip text for the control. */
  label: string;
  /** Human-readable keyboard shortcut shown in the tooltip (e.g. `⌘B`). */
  shortcut?: string;
  /** Short text glyph rendered instead of an icon (used by the heading controls). */
  text?: string;
  /** Registry icon rendered on the control — overridable via `provideThalassicIcons`. */
  icon?: systemIcon;
  /** The ProseMirror command the control dispatches. */
  command: Command;
  /** Whether the control's formatting is applied to the current selection. */
  isActive: (state: EditorState) => boolean;
}

/**
 * Editor actions that need the host component (e.g. UI beyond the document), wired into the
 * plugin keymap so their keyboard shortcuts reach the component.
 */
export interface RichTextEditorHandlers {
  /** Toggles the link on the current selection (opens the URL editor when adding one). */
  toggleLink: () => boolean;
}

/** A toolbar entry resolved for rendering: either a separator or a control. */
export interface RichTextResolvedEntry {
  separator: boolean;
  button: RichTextToolbarButton | null;
}
