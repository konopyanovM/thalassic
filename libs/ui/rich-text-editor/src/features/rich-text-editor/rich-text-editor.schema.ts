import { Schema } from 'prosemirror-model';
import { schema as markdownSchema } from 'prosemirror-markdown';

/**
 * The editor document schema. It reuses `prosemirror-markdown`'s Markdown-capable
 * node/mark set (paragraph, headings, blockquote, code block, ordered/bullet lists,
 * strong, em, inline code, link) so every document round-trips losslessly to Markdown,
 * extended with a `strikethrough` mark for GFM `~~…~~`.
 */
export const richTextSchema: Schema = new Schema({
  nodes: markdownSchema.spec.nodes,
  marks: markdownSchema.spec.marks.addToEnd('strikethrough', {
    parseDOM: [
      { tag: 's' },
      { tag: 'del' },
      { style: 'text-decoration=line-through' },
      { style: 'text-decoration-line=line-through' },
    ],
    toDOM: () => ['s', 0],
  }),
});
