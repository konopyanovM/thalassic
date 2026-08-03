import MarkdownIt from 'markdown-it';
import {
  defaultMarkdownParser,
  defaultMarkdownSerializer,
  MarkdownParser,
  MarkdownSerializer,
} from 'prosemirror-markdown';
import { richTextSchema } from './rich-text-editor.schema';

/**
 * Serializes an editor document to a Markdown string. Extends the default serializer
 * with the `strikethrough` mark, emitted as GFM `~~…~~`.
 */
export const markdownSerializer = new MarkdownSerializer(defaultMarkdownSerializer.nodes, {
  ...defaultMarkdownSerializer.marks,
  strikethrough: {
    open: '~~',
    close: '~~',
    mixable: true,
    expelEnclosingWhitespace: true,
  },
});

/**
 * Parses a Markdown string into an editor document. Uses a dedicated CommonMark tokenizer
 * (matching `prosemirror-markdown`'s default, without mutating that shared instance) with
 * strikethrough enabled so `~~…~~` maps onto the `strikethrough` mark, and targets the
 * extended {@link richTextSchema}.
 */
export const markdownParser = new MarkdownParser(
  richTextSchema,
  new MarkdownIt('commonmark', { html: false }).enable('strikethrough'),
  {
    ...defaultMarkdownParser.tokens,
    s: { mark: 'strikethrough' },
  },
);
