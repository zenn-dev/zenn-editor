import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { userEvent } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { waitSelectionChange } from '../../../../tests/dom';
import { renderTiptapEditor } from '../../../../tests/editor';
import { HorizontalRule } from '..';

const basicExtension = [Document, Paragraph, Text, HorizontalRule];

describe('InputRule', () => {
  it('undoableがOFFになっている (---)', async () => {
    const editor = renderTiptapEditor({
      content: '<p></p>',
      extensions: basicExtension,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().run();
    });

    await userEvent.keyboard('--- ');
    await userEvent.keyboard('{Backspace}');

    const docString = editor.state.doc.toString();
    expect(docString).toBe('doc(horizontalRule)');
  });

  it('undoableがOFFになっている (___)', async () => {
    const editor = renderTiptapEditor({
      content: '<p></p>',
      extensions: basicExtension,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().run();
    });

    await userEvent.keyboard('___ ');
    await userEvent.keyboard('{Backspace}');

    const docString = editor.state.doc.toString();
    expect(docString).toBe('doc(horizontalRule)');
  });

  it('undoableがOFFになっている (***)', async () => {
    const editor = renderTiptapEditor({
      content: '<p></p>',
      extensions: basicExtension,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().run();
    });

    await userEvent.keyboard('*** ');
    await userEvent.keyboard('{Backspace}');

    const docString = editor.state.doc.toString();
    expect(docString).toBe('doc(horizontalRule)');
  });
});