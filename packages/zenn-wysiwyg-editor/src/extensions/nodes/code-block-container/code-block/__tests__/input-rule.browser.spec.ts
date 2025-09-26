import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { userEvent } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { waitSelectionChange } from '../../../../../tests/dom';
import { renderTiptapEditor } from '../../../../../tests/editor';
import { Details } from '../../../details';
import { DetailsContent } from '../../../details/content';
import { DetailsSummary } from '../../../details/summary';
import { CodeBlockFileName } from '../../code-block-file-name';
import { DiffCodeBlock } from '../../diff-code-block';
import { DiffCodeLine } from '../../diff-code-block/diff-code-line';
import { CodeBlockContainer } from '../../index';
import { CodeBlock } from '../index';

const basicExtension = [
  Document,
  Paragraph,
  Text,
  CodeBlockContainer,
  CodeBlock,
  CodeBlockFileName,
  DiffCodeBlock,
  DiffCodeLine,
  HardBreak,
];

describe('InputRule', () => {
  it('``` でコードブロックが作成される', async () => {
    const editor = renderTiptapEditor({
      content: '<p>Text</p>',
      extensions: basicExtension,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().run();
    });
    await userEvent.keyboard('``` ');

    const docString = editor.state.doc.toString();
    expect(docString).toBe(
      'doc(codeBlockContainer(codeBlockFileName, codeBlock("Text")))'
    );
    const $node = editor.$node('codeBlock', {
      language: 'plaintext',
    });
    expect($node).not.toBeNull();
    expect(editor.state.selection.from).toBe(4);
  });

  it('```typescript で言語指定コードブロックが作成される', async () => {
    const editor = renderTiptapEditor({
      content: '<p>Text</p>',
      extensions: basicExtension,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().run();
    });
    await userEvent.keyboard('```typescript ');

    const docString = editor.state.doc.toString();
    const $node = editor.$node('codeBlock', {
      language: 'typescript',
    });

    expect(docString).toBe(
      'doc(codeBlockContainer(codeBlockFileName, codeBlock("Text")))'
    );
    expect($node).not.toBeNull();
    expect(editor.state.selection.from).toBe(4);
  });

  it('```typescript:main.ts でファイル名付きコードブロックが作成される', async () => {
    const editor = renderTiptapEditor({
      content: '<p>Text</p>',
      extensions: basicExtension,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().run();
    });
    await userEvent.keyboard('```typescript:main.ts ');

    const docString = editor.state.doc.toString();
    const $node = editor.$node('codeBlock', {
      language: 'typescript',
    });

    expect(docString).toBe(
      'doc(codeBlockContainer(codeBlockFileName("main.ts"), codeBlock("Text")))'
    );
    expect($node).not.toBeNull();
    expect(editor.state.selection.from).toBe(11);
  });

  it('ファイル名で入力ができる', async () => {
    const editor = renderTiptapEditor({
      content: '<p>Text</p>',
      extensions: basicExtension,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().run();
    });
    await userEvent.keyboard('``` ');

    await waitSelectionChange(() => {
      editor.chain().setTextSelection(2).run();
    });

    await userEvent.keyboard('a');

    const docString = editor.state.doc.toString();
    expect(docString).toBe(
      'doc(codeBlockContainer(codeBlockFileName("a"), codeBlock("Text")))'
    );
  });

  it('行の途中では InputRule が発動しない', async () => {
    const editor = renderTiptapEditor({
      content: '<p>Text</p>',
      extensions: basicExtension,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().setTextSelection(2).run();
    });
    await userEvent.keyboard('``` ');

    const docString = editor.state.doc.toString();
    expect(docString).toBe('doc(paragraph("T``` ext"))');
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
    await userEvent.keyboard('``` ');

    const docString = editor.state.doc.toString();
    expect(docString).toBe(
      'doc(details(detailsSummary("``` "), detailsContent(paragraph("Text"))))'
    );
  });

  it('```nonexistent で存在しない言語を指定するとplaintextになる', async () => {
    const editor = renderTiptapEditor({
      content: '<p>Text</p>',
      extensions: basicExtension,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().run();
    });
    await userEvent.keyboard('```nonexistent ');

    const docString = editor.state.doc.toString();
    const $node = editor.$node('codeBlock', {
      language: 'plaintext',
    });

    expect(docString).toBe(
      'doc(codeBlockContainer(codeBlockFileName, codeBlock("Text")))'
    );
    expect($node).not.toBeNull();
    expect(editor.state.selection.from).toBe(4);
  });

  it('undoableがOFFになっている', async () => {
    const editor = renderTiptapEditor({
      content: '<p>test</p>',
      extensions: basicExtension,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().run();
    });

    await userEvent.keyboard('``` ');
    await userEvent.keyboard('{Backspace}');

    const docString = editor.state.doc.toString();
    expect(docString).toBe('doc(paragraph("test"))');
  });
});
