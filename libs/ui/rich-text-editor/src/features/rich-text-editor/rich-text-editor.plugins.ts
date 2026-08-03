import { baseKeymap, chainCommands, exitCode, toggleMark } from 'prosemirror-commands';
import { history, redo, undo } from 'prosemirror-history';
import {
  inputRules,
  textblockTypeInputRule,
  undoInputRule,
  wrappingInputRule,
} from 'prosemirror-inputrules';
import { keymap } from 'prosemirror-keymap';
import { Schema } from 'prosemirror-model';
import { liftListItem, sinkListItem, splitListItem } from 'prosemirror-schema-list';
import { Plugin } from 'prosemirror-state';
import { RichTextEditorHandlers } from './rich-text-editor.types';

// Markdown-style typing shortcuts: `# ` for headings, `- `/`* ` for bullet lists,
// `1. ` for ordered lists, `> ` for blockquotes, and a fenced ``` for code blocks.
function buildInputRules(schema: Schema): Plugin {
  return inputRules({
    rules: [
      wrappingInputRule(/^\s*>\s$/, schema.nodes['blockquote']),
      wrappingInputRule(
        /^(\d+)\.\s$/,
        schema.nodes['ordered_list'],
        match => ({ order: Number(match[1]) }),
        (match, node) => node.childCount + node.attrs['order'] === Number(match[1]),
      ),
      wrappingInputRule(/^\s*([-+*])\s$/, schema.nodes['bullet_list']),
      textblockTypeInputRule(/^```$/, schema.nodes['code_block']),
      textblockTypeInputRule(/^(#{1,3})\s$/, schema.nodes['heading'], match => ({
        level: match[1].length,
      })),
    ],
  });
}

// Keyboard shortcuts layered on top of the base editing keymap: inline-mark toggles,
// history, input-rule reversal, list splitting/indentation, and a soft line break.
// Shortcuts whose behavior lives in the host component (link editing) come from `handlers`.
function buildKeymap(schema: Schema, handlers: RichTextEditorHandlers): Plugin {
  const hardBreak = schema.nodes['hard_break'];
  const listItem = schema.nodes['list_item'];

  return keymap({
    'Mod-z': undo,
    'Shift-Mod-z': redo,
    'Mod-y': redo,

    Backspace: undoInputRule,

    'Mod-b': toggleMark(schema.marks['strong']),
    'Mod-i': toggleMark(schema.marks['em']),
    'Mod-`': toggleMark(schema.marks['code']),
    'Mod-k': () => handlers.toggleLink(),

    Enter: splitListItem(listItem),
    'Mod-[': liftListItem(listItem),
    'Mod-]': sinkListItem(listItem),

    'Shift-Enter': chainCommands(exitCode, (state, dispatch) => {
      if (dispatch) dispatch(state.tr.replaceSelectionWith(hardBreak.create()).scrollIntoView());
      return true;
    }),
  });
}

/** The full plugin stack shared by every editor instance built on {@link richTextSchema}. */
export function buildRichTextPlugins(schema: Schema, handlers: RichTextEditorHandlers): Plugin[] {
  return [buildInputRules(schema), buildKeymap(schema, handlers), keymap(baseKeymap), history()];
}
