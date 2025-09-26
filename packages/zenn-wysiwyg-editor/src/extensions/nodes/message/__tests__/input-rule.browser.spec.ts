import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { userEvent } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { waitSelectionChange } from '../../../../tests/dom';
import { renderTiptapEditor } from '../../../../tests/editor';
import { Details } from '../../details';
import { DetailsContent } from '../../details/content';
import { DetailsSummary } from '../../details/summary';
import { Message } from '../message';
import { MessageContent } from '../message-content';

const baseExtensions = [Document, Paragraph, Text, Message, MessageContent];

describe('InputRule', () => {
  it(':::message で メッセージブロックが作成される', async () => {
    const editor = renderTiptapEditor({
      content: '<p>Text</p>',
      extensions: baseExtensions,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().run();
    });
    await userEvent.keyboard(':::message ');

    const docString = editor.state.doc.toString();
    expect(docString).toBe('doc(message(messageContent(paragraph("Text"))))');
    expect(editor.state.selection.from).toBe(3);
  });

  it(':::alert で アラートブロックが作成される', async () => {
    const editor = renderTiptapEditor({
      content: '<p>Text</p>',
      extensions: baseExtensions,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().run();
    });
    await userEvent.keyboard(':::alert ');

    const docString = editor.state.doc.toString();
    expect(docString).toBe('doc(message(messageContent(paragraph("Text"))))');
    expect(editor.state.doc.firstChild?.attrs.type).toEqual('alert');
    expect(editor.state.selection.from).toBe(3);
  });

  it('行の途中では InputRule が発動しない', async () => {
    const editor = renderTiptapEditor({
      content: '<p>Text</p>',
      extensions: baseExtensions,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().setTextSelection(2).run();
    });
    await userEvent.keyboard(':::alert ');

    const docString = editor.state.doc.toString();
    expect(docString).toBe('doc(paragraph("T:::alert ext"))');
  });

  it('アコーディオンのタイトルでは InputRule が発動しない', async () => {
    const editor = renderTiptapEditor({
      content:
        '<details><summary></summary><div class="details-content"><p>Text</p></div></details>',
      extensions: [...baseExtensions, Details, DetailsContent, DetailsSummary],
    });

    await waitSelectionChange(() => {
      editor.chain().focus().setTextSelection(2).run();
    });
    await userEvent.keyboard(':::alert ');

    const docString = editor.state.doc.toString();
    expect(docString).toBe(
      'doc(details(detailsSummary(":::alert "), detailsContent(paragraph("Text"))))'
    );
  });

  it(':::message のundoableがOFFになっている', async () => {
    const editor = renderTiptapEditor({
      content: '<p>test</p>',
      extensions: baseExtensions,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().run();
    });
    await userEvent.keyboard(':::message ');
    await userEvent.keyboard('{Backspace}');

    const docString = editor.state.doc.toString();
    expect(docString).toBe('doc(paragraph("test"))');
  });

  it(':::alert のundoableがOFFになっている', async () => {
    const editor = renderTiptapEditor({
      content: '<p>test</p>',
      extensions: baseExtensions,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().run();
    });
    await userEvent.keyboard(':::alert ');
    await userEvent.keyboard('{Backspace}');

    const docString = editor.state.doc.toString();
    expect(docString).toBe('doc(paragraph("test"))');
  });
});
