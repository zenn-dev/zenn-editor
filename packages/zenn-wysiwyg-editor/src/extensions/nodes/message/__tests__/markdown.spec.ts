import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { describe, expect, it } from 'vitest';
import { convertMarkdownToEditable } from '../../../../lib/from-markdown';
import { markdownSerializer } from '../../../../lib/to-markdown';
import { renderTiptapEditor } from '../../../../tests/editor';
import { Message } from '../message';
import { MessageContent } from '../message-content';

const basicExtension = [Document, Paragraph, Text, Message, MessageContent];

describe('マークダウン', () => {
  it('メッセージノードをマークダウンに変換できる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content:
        '<aside class="msg"><div class="msg-content"><p>メッセージ</p></div></aside>',
    });

    const markdown = markdownSerializer.serialize(editor.state.doc);

    expect(markdown).toBe(':::message\nメッセージ\n:::');
  });

  it('メッセージアラートのノードをマークダウンに変換できる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content:
        '<aside class="msg alert"><div class="msg-content"><p>メッセージ</p></div></aside>',
    });

    const markdown = markdownSerializer.serialize(editor.state.doc);
    expect(markdown).toBe(':::message alert\nメッセージ\n:::');
  });

  it('メッセージノードのネストをマークダウンに変換できる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content: `
        <aside class="msg"><div class="msg-content">
        <p>メッセージ</p>
        <aside class="msg alert"><div class="msg-content"><p>ネスト</p></div></aside>
        </div>
        </aside>`,
    });

    const markdown = markdownSerializer.serialize(editor.state.doc);

    expect(markdown).toBe(
      '::::message\nメッセージ\n\n:::message alert\nネスト\n:::\n::::'
    );
  });

  it('マークダウンからメッセージノードに変換', () => {
    const markdown = `:::message\nメッセージ\n:::`;

    const html = convertMarkdownToEditable(markdown);
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content: html,
    });
    const docString = editor.state.doc.toString();

    expect(docString).toBe(
      'doc(message(messageContent(paragraph("メッセージ"))))'
    );
  });
});
