import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { userEvent } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { waitSelectionChange } from '../../../../../tests/dom';
import { renderTiptapEditor } from '../../../../../tests/editor';
import { CodeBlock } from '../../code-block';
import { CodeBlockFileName } from '../../code-block-file-name';
import { CodeBlockContainer } from '../../index';
import { DiffCodeBlock } from '..';
import { DiffCodeLine } from '../diff-code-line';

const baseExtensions = [
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
  it('```diff で差分コードブロックが作成される', async () => {
    const editor = renderTiptapEditor({
      content: '<p>Text</p>',
      extensions: baseExtensions,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().run();
    });
    await userEvent.keyboard('```diff ');

    const docString = editor.state.doc.toString();
    expect(docString).toBe(
      'doc(codeBlockContainer(codeBlockFileName, diffCodeBlock(diffCodeLine("Text"))))'
    );
    const $node = editor.$node('diffCodeBlock', {
      language: 'plaintext',
    });
    expect($node).not.toBeNull();
    expect(editor.state.selection.from).toBe(5);
  });

  it('```diff-typescript で言語指定の差分コードブロックが作成される', async () => {
    const editor = renderTiptapEditor({
      content: '<p>Text</p>',
      extensions: baseExtensions,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().run();
    });
    await userEvent.keyboard('```diff-typescript ');

    const docString = editor.state.doc.toString();
    const $node = editor.$node('diffCodeBlock', {
      language: 'typescript',
    });

    expect(docString).toBe(
      'doc(codeBlockContainer(codeBlockFileName, diffCodeBlock(diffCodeLine("Text"))))'
    );
    expect($node).not.toBeNull();
    expect(editor.state.selection.from).toBe(5);
  });

  it('```diff-typescript:main.ts でファイル名付き差分コードブロックが作成される', async () => {
    const editor = renderTiptapEditor({
      content: '<p>Text</p>',
      extensions: baseExtensions,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().run();
    });
    await userEvent.keyboard('```diff-typescript:main.ts ');

    const docString = editor.state.doc.toString();
    const $node = editor.$node('diffCodeBlock', {
      language: 'typescript',
    });

    expect(docString).toBe(
      'doc(codeBlockContainer(codeBlockFileName("main.ts"), diffCodeBlock(diffCodeLine("Text"))))'
    );

    expect($node).not.toBeNull();
    expect(editor.state.selection.from).toBe(12);
  });

  it('undoableがOFFになっている', async () => {
    const editor = renderTiptapEditor({
      content: '<p>test</p>',
      extensions: baseExtensions,
    });

    await waitSelectionChange(() => {
      editor.chain().focus().run();
    });

    await userEvent.keyboard('```diff ');
    await userEvent.keyboard('{Backspace}');

    const docString = editor.state.doc.toString();
    expect(docString).toBe('doc(paragraph("test"))');
  });
});
