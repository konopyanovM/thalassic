import { lift, setBlockType, toggleMark, wrapIn } from 'prosemirror-commands';
import { MarkType, NodeType, Schema } from 'prosemirror-model';
import { liftListItem, wrapInList } from 'prosemirror-schema-list';
import { Command, EditorState, NodeSelection } from 'prosemirror-state';
import { RichTextEditorLabels } from './rich-text-editor.config';
import { IS_APPLE_PLATFORM } from './rich-text-editor.constants';
import { RichTextToolbarButton, richTextToolbarItem } from './rich-text-editor.types';

// Human-readable label for a `Mod-<key>` shortcut on the current platform (e.g. ⌘B / Ctrl+B).
function shortcutLabel(key: string): string {
  return IS_APPLE_PLATFORM ? `⌘${key}` : `Ctrl+${key}`;
}

// Whether `markType` is applied across the selection (or is queued on an empty selection).
function markActive(state: EditorState, markType: MarkType): boolean {
  const { from, $from, to, empty } = state.selection;
  if (empty) return Boolean(markType.isInSet(state.storedMarks || $from.marks()));
  return state.doc.rangeHasMark(from, to, markType);
}

// Whether the selection's textblock is exactly `nodeType` (optionally matching `attrs`).
function blockActive(
  state: EditorState,
  nodeType: NodeType,
  attrs?: Record<string, unknown>,
): boolean {
  const selection = state.selection;
  if (selection instanceof NodeSelection) return selection.node.hasMarkup(nodeType, attrs);

  const { $from, to } = selection;
  return to <= $from.end() && $from.parent.hasMarkup(nodeType, attrs);
}

// Whether the selection sits inside a list/blockquote of `nodeType` (walks ancestors).
function ancestorActive(state: EditorState, nodeType: NodeType): boolean {
  const { $from } = state.selection;
  for (let depth = $from.depth; depth > 0; depth--) {
    if ($from.node(depth).type === nodeType) return true;
  }
  return false;
}

// Toggles list membership: wraps the selection in `listType`, or lifts it out one
// level when the selection already sits inside one — so the toolbar control both
// enters and leaves the list instead of silently failing on a wrapped selection.
function toggleList(listType: NodeType, itemType: NodeType): Command {
  return (state, dispatch, view) => {
    const command = ancestorActive(state, listType) ? liftListItem(itemType) : wrapInList(listType);
    return command(state, dispatch, view);
  };
}

// Toggles a wrapping node (blockquote): wraps the selection, or lifts it out when
// the selection already sits inside one.
function toggleWrap(nodeType: NodeType): Command {
  return (state, dispatch, view) => {
    const command = ancestorActive(state, nodeType) ? lift : wrapIn(nodeType);
    return command(state, dispatch, view);
  };
}

// Toggles between a heading of the given level and a plain paragraph.
function toggleHeading(headingType: NodeType, paragraphType: NodeType, level: number): Command {
  return (state, dispatch, view) => {
    const command = blockActive(state, headingType, { level })
      ? setBlockType(paragraphType)
      : setBlockType(headingType, { level });
    return command(state, dispatch, view);
  };
}

/**
 * Builds the runtime toolbar-control map for a schema: each entry pairs the ProseMirror
 * command it dispatches with the predicate that reflects its active state. The `link`
 * control's command removes an existing link; adding a link is handled by the component,
 * which supplies the target URL.
 */
export function buildToolbarButtons(
  schema: Schema,
  labels: RichTextEditorLabels,
): Record<richTextToolbarItem, RichTextToolbarButton> {
  const { strong, em, strikethrough, code, link } = schema.marks;
  const { heading, bullet_list, ordered_list, blockquote, code_block, paragraph, list_item } =
    schema.nodes;

  return {
    bold: {
      id: 'bold',
      icon: 'bold',
      label: labels.controls.bold,
      shortcut: shortcutLabel('B'),
      command: toggleMark(strong),
      isActive: state => markActive(state, strong),
    },
    italic: {
      id: 'italic',
      icon: 'italic',
      label: labels.controls.italic,
      shortcut: shortcutLabel('I'),
      command: toggleMark(em),
      isActive: state => markActive(state, em),
    },
    strikethrough: {
      id: 'strikethrough',
      icon: 'strikethrough',
      label: labels.controls.strikethrough,
      command: toggleMark(strikethrough),
      isActive: state => markActive(state, strikethrough),
    },
    code: {
      id: 'code',
      icon: 'inline-code',
      label: labels.controls.code,
      shortcut: shortcutLabel('`'),
      command: toggleMark(code),
      isActive: state => markActive(state, code),
    },
    heading1: {
      id: 'heading1',
      label: labels.controls.heading1,
      text: 'H1',
      command: toggleHeading(heading, paragraph, 1),
      isActive: state => blockActive(state, heading, { level: 1 }),
    },
    heading2: {
      id: 'heading2',
      label: labels.controls.heading2,
      text: 'H2',
      command: toggleHeading(heading, paragraph, 2),
      isActive: state => blockActive(state, heading, { level: 2 }),
    },
    heading3: {
      id: 'heading3',
      label: labels.controls.heading3,
      text: 'H3',
      command: toggleHeading(heading, paragraph, 3),
      isActive: state => blockActive(state, heading, { level: 3 }),
    },
    bulletList: {
      id: 'bulletList',
      icon: 'bullet-list',
      label: labels.controls.bulletList,
      command: toggleList(bullet_list, list_item),
      isActive: state => ancestorActive(state, bullet_list),
    },
    orderedList: {
      id: 'orderedList',
      icon: 'ordered-list',
      label: labels.controls.orderedList,
      command: toggleList(ordered_list, list_item),
      isActive: state => ancestorActive(state, ordered_list),
    },
    blockquote: {
      id: 'blockquote',
      icon: 'blockquote',
      label: labels.controls.blockquote,
      command: toggleWrap(blockquote),
      isActive: state => ancestorActive(state, blockquote),
    },
    link: {
      id: 'link',
      icon: 'link',
      label: labels.controls.link,
      shortcut: shortcutLabel('K'),
      command: toggleMark(link),
      isActive: state => markActive(state, link),
    },
    codeBlock: {
      id: 'codeBlock',
      icon: 'code-block',
      label: labels.controls.codeBlock,
      command: (state, dispatch, view) => {
        const command = blockActive(state, code_block)
          ? setBlockType(paragraph)
          : setBlockType(code_block);
        return command(state, dispatch, view);
      },
      isActive: state => blockActive(state, code_block),
    },
  };
}
