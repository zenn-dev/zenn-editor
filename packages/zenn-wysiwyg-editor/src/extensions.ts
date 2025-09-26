import { Blockquote } from './extensions/nodes/blockquote';
import HardBreak from '@tiptap/extension-hard-break';
import { ListKeymap } from '@tiptap/extension-list';
import Paragraph from '@tiptap/extension-paragraph';
import { TableRow } from '@tiptap/extension-table';
import Text from '@tiptap/extension-text';
import { Dropcursor, TrailingNode, UndoRedo } from '@tiptap/extensions';
import { type Extensions, findParentNode } from '@tiptap/react';
import { Placeholder } from './extensions/functionality/placeholder';
import { Bold } from './extensions/marks/bold';
import { Code } from './extensions/marks/code';
import { Italic } from './extensions/marks/italic';
import { Link } from './extensions/marks/link';
import { Strike } from './extensions/marks/strike';
import { CodeBlockContainer } from './extensions/nodes/code-block-container';
import { CodeBlock } from './extensions/nodes/code-block-container/code-block';
import { CodeBlockFileName } from './extensions/nodes/code-block-container/code-block-file-name';
import { DiffCodeBlock } from './extensions/nodes/code-block-container/diff-code-block';
import { DiffCodeLine } from './extensions/nodes/code-block-container/diff-code-block/diff-code-line';
import { Details } from './extensions/nodes/details';
import { DetailsContent } from './extensions/nodes/details/content';
import { DetailsSummary } from './extensions/nodes/details/summary';
import Document from './extensions/nodes/document';
import { Embed } from './extensions/nodes/embed';
import { EmbedPasteHandler } from './extensions/nodes/embed/embed-paste-handler';
import { SpeakerDeckEmbed } from './extensions/nodes/embed/speaker-deck-embed';
import { Figure } from './extensions/nodes/figure';
import { Caption } from './extensions/nodes/figure/caption';
import { Image } from './extensions/nodes/figure/image';
import FootnoteItem from './extensions/nodes/footnotes/footnote-item';
import FootnoteReference from './extensions/nodes/footnotes/footnote-reference';
import Footnotes from './extensions/nodes/footnotes/footnotes';
import { FootnotesList } from './extensions/nodes/footnotes/footnotes-list';
import Heading from './extensions/nodes/heading';
import { HorizontalRule } from './extensions/nodes/horizontal-rule';
import { Message } from './extensions/nodes/message/message';
import { MessageContent } from './extensions/nodes/message/message-content';
import { TableCell } from './extensions/nodes/tables/cell';
import { TableHeader } from './extensions/nodes/tables/header';
import { Table } from './extensions/nodes/tables/table';
import { Typography } from './extensions/functionality/typography';
import { Loading } from './extensions/nodes/loading';
import { ListItem } from './extensions/nodes/list-item';
import { SlashCommand } from './extensions/functionality/slash-command';
import { BulletList } from './extensions/nodes/bullet-list';
import { OrderedList } from './extensions/nodes/ordered-list';

export const extensions: Extensions = [
  // === Core ===
  Document,
  Paragraph,
  Text,

  // === Nodes ===
  Heading.configure({
    levels: [1, 2, 3, 4],
  }),
  BulletList,
  OrderedList,
  ListItem,
  Blockquote,
  HorizontalRule,
  HardBreak,
  Message,
  MessageContent,
  CodeBlockContainer,
  CodeBlock,
  CodeBlockFileName,
  DiffCodeLine,
  DiffCodeBlock,
  Figure,
  Image,
  Caption,
  Embed,
  Details,
  DetailsSummary,
  DetailsContent,
  SpeakerDeckEmbed,
  FootnoteReference,
  Footnotes,
  FootnoteItem,
  FootnotesList,
  Table.configure({
    allowTableNodeSelection: true,
  }),
  TableCell,
  TableHeader,
  TableRow,
  Loading,

  // === Marks ===
  Bold,
  Italic,
  Strike,
  Code,
  Link.configure({
    autolink: false,
  }),

  // === Features ===
  UndoRedo,
  TrailingNode,
  Placeholder.configure({
    placeholder: ({ editor, node }) => {
      const { selection } = editor.state;
      const { $from } = selection;

      if (node.type === editor.schema.nodes.caption) {
        return 'キャプションを入力';
      } else if (
        findParentNode((node) => node.type === editor.schema.nodes.table)(
          editor.state.selection
        )
      ) {
        return '';
      } else if (
        node.type === editor.schema.nodes.paragraph &&
        $from.depth === 1
      ) {
        return 'コマンドは「/」で表示（段落の先頭でのみ）';
      }

      return 'ここに入力';
    },
  }),
  EmbedPasteHandler,
  Dropcursor,
  ListKeymap,
  Typography,
  SlashCommand,
];
