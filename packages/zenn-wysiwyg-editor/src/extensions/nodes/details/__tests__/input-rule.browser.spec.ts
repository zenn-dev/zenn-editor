import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { userEvent } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { waitSelectionChange } from '../../../../tests/dom';
import { renderTiptapEditor } from '../../../../tests/editor';
import { Details } from '..';
import { DetailsContent } from '../content';
import { DetailsSummary } from '../summary';

const basicExtension = [
  Document,
  Paragraph,
  Text,
  Details,
  DetailsContent,
  DetailsSummary,
];

describe('InputRule', () => {
  it(':::details で アコーディオンブロックが作成される', async () => {
    const editor = renderTiptapEditor({
      content: '<p>Text</p>',
      extensions: basicExtension,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().run();
    });
    await userEvent.keyboard(':::details ');

    const docString = editor.state.doc.toString();
    expect(docString).toBe(
      'doc(details(detailsSummary, detailsContent(paragraph("Text"))))'
    );
    expect(editor.state.selection.from).toBe(2);
  });

  it('行の途中では InputRule が発動しない', async () => {
    const editor = renderTiptapEditor({
      content: '<p>Text</p>',
      extensions: basicExtension,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().setTextSelection(2).run();
    });
    await userEvent.keyboard(':::details ');

    const docString = editor.state.doc.toString();
    expect(docString).toBe('doc(paragraph("T:::details ext"))');
  });

  it('アコーディオンのタイトル内では InputRule が発動しない', async () => {
    const editor = renderTiptapEditor({
      content:
        '<details><summary>Title</summary><div class="details-content"><p>Text</p></div></details>',
      extensions: basicExtension,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().setTextSelection(2).run();
    });
    await userEvent.keyboard(':::details ');

    const docString = editor.state.doc.toString();
    expect(docString).toBe(
      'doc(details(detailsSummary(":::details Title"), detailsContent(paragraph("Text"))))'
    );
  });

  it(':::details のundoableがOFFになっている', async () => {
    const editor = renderTiptapEditor({
      content: '<p></p>',
      extensions: basicExtension,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().run();
    });
    await userEvent.keyboard(':::details ');
    await userEvent.keyboard('{Backspace}');

    const docString = editor.state.doc.toString();
    expect(docString).toBe('doc(paragraph, paragraph)');
  });
});
