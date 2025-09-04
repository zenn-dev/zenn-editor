import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { userEvent } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { waitSelectionChange } from '../../../../tests/dom';
import { renderTiptapEditor } from '../../../../tests/editor';
import Heading from '..';

const basicExtension = [Document, Paragraph, Text, Heading];

describe('キー入力', () => {
  it('Enterで見出しが分割される', async () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content: '<h1>見出し</h1>',
    });

    await waitSelectionChange(() => {
      editor.chain().focus().setTextSelection(2).run();
    });
    await userEvent.keyboard('{Enter}');

    const doc = editor.state.doc.toString();
    expect(doc).toBe('doc(heading("見"), paragraph("出し"))');
    expect(editor.state.selection.from).toBe(4);
  });

  it('先頭でBackspaceを押す', async () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content: '<h1>見出し</h1>',
    });

    await waitSelectionChange(() => {
      editor.chain().focus().setTextSelection(1).run();
    });
    await userEvent.keyboard('{Backspace}');

    const doc = editor.state.doc.toString();
    expect(doc).toBe('doc(paragraph("見出し"))');
    expect(editor.state.selection.from).toBe(1);
  });
});
