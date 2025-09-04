import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { describe, expect, it } from 'vitest';
import { renderTiptapEditor } from '../../../../tests/editor';
import { Message } from '../message';
import { MessageContent } from '../message-content';

const basicExtension = [Document, Paragraph, Text, Message, MessageContent];

describe('HTMLのレンダリング', () => {
  it('メッセージタイプが正しいHTMLでレンダリングされる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content:
        '<aside class="msg"><div class="msg-content"><p>メッセージ</p></div></aside>',
    });

    const html = editor.getHTML();
    expect(html).toContain('<aside class="msg">');
    expect(html).not.toContain('class="msg alert"');
  });

  it('アラートタイプが正しいHTMLでレンダリングされる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content:
        '<aside class="msg alert"><div class="msg-content"><p>メッセージ</p></div></aside>',
    });

    const html = editor.getHTML();
    expect(html).toContain('<aside class="msg alert">');
  });

  it('HTMLにレンダリング後にパースできる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content:
        '<aside class="msg alert"><div class="msg-content"><p>メッセージ</p></div></aside>',
    });

    const html = editor.getHTML();
    editor.commands.setContent(html);

    const docString = editor.state.doc.toString();

    expect(docString).toBe(
      'doc(message(messageContent(paragraph("メッセージ"))))'
    );
  });
});
