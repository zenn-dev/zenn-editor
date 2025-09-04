import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { userEvent } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { waitSelectionChange } from '../../../../tests/dom';
import { renderTiptapEditor } from '../../../../tests/editor';
import { Message } from '../message';
import { MessageContent } from '../message-content';

const basicExtension = [Document, Paragraph, Text, Message, MessageContent];

describe('キー入力', () => {
  describe('Backspace', () => {
    it('メッセージコンテンツの先頭で押すとメッセージブロックが解除される', async () => {
      const editor = renderTiptapEditor({
        content:
          '<aside class="msg"><div class="msg-content"><p>Text</p></div></aside>',
        extensions: basicExtension,
      });

      await waitSelectionChange(() => {
        editor.chain().focus().setTextSelection(3).run();
      });
      await userEvent.keyboard('{Backspace}');

      const docString = editor.state.doc.toString();
      expect(docString).toBe('doc(paragraph("Text"))');
      expect(editor.state.selection.from).toBe(1);
    });
  });

  describe('Enter', () => {
    it('メッセージコンテンツ内で改行される', async () => {
      const editor = renderTiptapEditor({
        content:
          '<aside class="msg"><div class="msg-content"><p>Text</p></div></aside>',
        extensions: basicExtension,
      });

      await waitSelectionChange(() => {
        editor.chain().focus().setTextSelection(4).run();
      });
      await userEvent.keyboard('{Enter}');

      const docString = editor.state.doc.toString();
      expect(docString).toBe(
        'doc(message(messageContent(paragraph("T"), paragraph("ext"))))'
      );
      expect(editor.state.selection.from).toBe(6);
    });
  });
});
