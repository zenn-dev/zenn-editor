import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { userEvent } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import LakeImage from '../../../../tests/assets/sikotuko.jpeg';
import { waitSelectionChange } from '../../../../tests/dom';
import { renderTiptapEditor } from '../../../../tests/editor';
import { Details } from '../../details';
import { DetailsContent } from '../../details/content';
import { DetailsSummary } from '../../details/summary';
import { Caption } from '../caption';
import { Image } from '../image';
import { Link } from '../../../marks/link';
import { Figure } from '../index';

const basicExtension = [
  Document,
  Paragraph,
  Text,
  Figure,
  Caption,
  Image,
  Link,
];

describe('InputRule', () => {
  it('![alt](src) で Figure ノードが作成される', async () => {
    const editor = renderTiptapEditor({
      content: '<p></p>',
      extensions: basicExtension,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().run();
    });
    await userEvent.keyboard(`!{[}支笏湖{]}(${LakeImage}) `);

    const docString = editor.state.doc.toString();
    expect(docString).toBe('doc(figure(image, caption))');
    expect(editor.state.selection.from).toBe(3);
    expect(editor.state.doc.firstChild?.firstChild?.attrs).toEqual({
      src: LakeImage,
      alt: '支笏湖',
      width: null,
      isLoadingError: false,
    });
  });

  it('行の途中では InputRule が発動しない', async () => {
    const editor = renderTiptapEditor({
      content: '<p>Text</p>',
      extensions: basicExtension,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().setTextSelection(2).run();
    });
    await userEvent.keyboard(`!{[}支笏湖{]}(${LakeImage}) `);

    const docString = editor.state.doc.toString();
    expect(docString).toBe(`doc(paragraph("T![支笏湖](${LakeImage}) ext"))`);
  });

  it('アコーディオンのタイトルでは InputRule が発動しない', async () => {
    const editor = renderTiptapEditor({
      content:
        '<details><summary></summary><div class="details-content"><p>Text</p></div></details>',
      extensions: [...basicExtension, Details, DetailsContent, DetailsSummary],
    });

    await waitSelectionChange(() => {
      editor.chain().focus().setTextSelection(2).run();
    });
    await userEvent.keyboard(`!{[}支笏湖{]}(${LakeImage}) `);

    const docString = editor.state.doc.toString();
    expect(docString).toBe(
      `doc(details(detailsSummary("![支笏湖](${LakeImage}) "), detailsContent(paragraph("Text"))))`
    );
  });

  it('undoableがOFFになっている', async () => {
    const editor = renderTiptapEditor({
      content: '<p></p>',
      extensions: basicExtension,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().run();
    });
    await userEvent.keyboard(`!{[}支笏湖{]}(${LakeImage}) `);
    await userEvent.keyboard('{Backspace}');

    const docString = editor.state.doc.toString();
    expect(docString).toBe('doc(paragraph)');
  });
});
