import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { describe, expect, it } from 'vitest';
import { convertMarkdownToEditable } from '../../../../lib/from-markdown';
import { markdownSerializer } from '../../../../lib/to-markdown';
import LakeImage from '../../../../tests/assets/sikotuko.jpeg';
import { renderTiptapEditor } from '../../../../tests/editor';
import { Caption } from '../caption';
import { Image } from '../image';
import Figure from '../index';

const basicExtension = [Document, Paragraph, Text, Figure, Image, Caption];

describe('マークダウン', () => {
  it('Figureノードをマークダウンに変換できる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content: `<p><img src="${LakeImage}" alt="支笏湖"><em>支笏湖</em></p>`,
    });

    const markdown = markdownSerializer.serialize(editor.state.doc);

    expect(markdown).toBe(`![支笏湖](${LakeImage})\n*支笏湖*`);
  });

  it('キャプションなしのFigureノードをマークダウンに変換できる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content: `<p><img src="${LakeImage}" alt="支笏湖"></p>`,
    });

    const markdown = markdownSerializer.serialize(editor.state.doc);

    expect(markdown).toBe(`![支笏湖](${LakeImage})`);
  });

  it('マークダウンからFigureノードに変換', () => {
    const markdown = `![支笏湖](${LakeImage})\n*支笏湖*`;

    const html = convertMarkdownToEditable(markdown);
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content: html,
    });
    const docString = editor.state.doc.toString();

    expect(docString).toBe('doc(figure(image, caption("支笏湖")))');
  });

  it('キャプションなしのマークダウンからFigureノードに変換', () => {
    const markdown = `![支笏湖](${LakeImage})`;

    const html = convertMarkdownToEditable(markdown);
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content: html,
    });
    const docString = editor.state.doc.toString();

    expect(docString).toBe('doc(figure(image, caption))');
  });
});
