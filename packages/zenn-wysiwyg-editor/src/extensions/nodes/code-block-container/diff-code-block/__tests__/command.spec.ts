import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { describe, expect, it } from 'vitest';
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

// 親要素におけるかのテストはcode-blockで対応する
describe('コマンド', () => {
  describe('setAllSelectionInCodeBlock', () => {
    it('1行の差分コードブロック全体を選択できる', () => {
      const editor = renderTiptapEditor({
        extensions: baseExtensions,
        content:
          '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div><pre><code class="language-diff-javascript diff-highlight"><span>console.log("hello");</span></code></pre></div>',
      });

      // コードブロック内にカーソルを配置
      editor.commands.setTextSelection(5);

      // コードブロック全体を選択
      editor.commands.setAllSelectionInCodeBlock();

      const { from, to } = editor.state.selection;

      expect(from).toBe(5);
      expect(to).toBe(26);
    });

    it('複数行の差分コードブロック全体を選択できる', () => {
      const editor = renderTiptapEditor({
        extensions: baseExtensions,
        content: `<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div>
        <pre><code class="language-diff diff-highlight"><span>1</span><span>2</span><span>3</span></code></pre></div>`,
      });

      // コードブロック内にカーソルを配置
      editor.commands.setTextSelection(5);

      // コードブロック全体を選択
      editor.commands.setAllSelectionInCodeBlock();

      const { from, to } = editor.state.selection;

      expect(from).toBe(5);
      expect(to).toBe(12);
    });
  });

  describe('setCodeBlockContainer', () => {
    it('段落を差分コードブロックに変換できる', () => {
      const editor = renderTiptapEditor({
        extensions: baseExtensions,
        content: '<p>console.log("hello");</p>',
      });

      // 段落を選択
      editor.commands.setTextSelection(1);

      // コードブロックに変換
      editor.commands.setCodeBlockContainer({ language: 'diff-javascript' });

      const docString = editor.state.doc.toString();
      expect(docString).toBe(
        'doc(codeBlockContainer(codeBlockFileName, diffCodeBlock(diffCodeLine("console.log(\\"hello\\");"))))'
      );
    });

    it('改行ありの段落を保持したまま変換できる', () => {
      const editor = renderTiptapEditor({
        extensions: baseExtensions,
        content: '<p>const a = 1;<br><br>const a = 2;</p>',
      });

      // 段落を選択
      editor.commands.setTextSelection(1);

      // コードブロックに変換
      editor.commands.setCodeBlockContainer({ language: 'diff-javascript' });

      const docString = editor.state.doc.toString();
      expect(docString).toBe(
        'doc(codeBlockContainer(codeBlockFileName, diffCodeBlock(diffCodeLine("const a = 1;"), diffCodeLine, diffCodeLine("const a = 2;"))))'
      );
    });

    it('段落を跨ぐ範囲選択時に変換できる', () => {
      const editor = renderTiptapEditor({
        extensions: baseExtensions,
        content: '<p>const a = 1;</p><p>const a = 2;</p>',
      });

      // 段落を選択
      editor.commands.setTextSelection({ from: 1, to: 15 });

      // コードブロックに変換
      editor.commands.setCodeBlockContainer({ language: 'diff-javascript' });

      const docString = editor.state.doc.toString();
      expect(docString).toBe(
        'doc(codeBlockContainer(codeBlockFileName, diffCodeBlock(diffCodeLine("const a = 1;"), diffCodeLine("const a = 2;"))))'
      );
    });
  });

  describe('unsetCodeBlockContainer', () => {
    it('差分コードブロックを段落に戻せる', () => {
      const editor = renderTiptapEditor({
        extensions: baseExtensions,
        content: `<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div>
        <pre><code class="language-diff-javascript diff-highlight"><span>const a= 1;</span></code></pre></div>`,
      });

      // コードブロック内にカーソルを配置
      editor.commands.setTextSelection(4);

      // コードブロックを解除
      editor.commands.unsetCodeBlockContainer();

      const docString = editor.state.doc.toString();
      expect(docString).toBe('doc(paragraph("const a= 1;"))');
    });

    it('複数行持つ差分コードブロックを段落に戻せる', () => {
      const editor = renderTiptapEditor({
        extensions: baseExtensions,
        content: `<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div>
        <pre><code class="language-diff-javascript diff-highlight"><span>const a = 1;</span><span>const a = 2;</span></code></pre></div>`,
      });

      // コードブロック内にカーソルを配置
      editor.commands.setTextSelection(4);

      // コードブロックを解除
      editor.commands.unsetCodeBlockContainer();

      const docString = editor.state.doc.toString();
      expect(docString).toBe(
        'doc(paragraph("const a = 1;", hardBreak, "const a = 2;"))'
      );
    });
  });
});
