import Document from '@tiptap/extension-document';
import { ListItem as TiptapListItem } from '@tiptap/extension-list/item';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { userEvent } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { waitSelectionChange } from '../../../../tests/dom';
import { renderTiptapEditor } from '../../../../tests/editor';
import { OrderedList } from '..';

const ListItem = TiptapListItem.extend({
  content: 'paragraph+',
});

const basicExtension = [Document, Paragraph, Text, OrderedList, ListItem];

describe('InputRule', () => {
  it('undoableがOFFになっている', async () => {
    const editor = renderTiptapEditor({
      content: '<p></p>',
      extensions: basicExtension,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().run();
    });

    await userEvent.keyboard('1. ');
    await userEvent.keyboard('{Backspace}');

    const docString = editor.state.doc.toString();
    expect(docString).toBe('doc(paragraph)');
  });
});