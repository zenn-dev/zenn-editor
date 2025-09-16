import Blockquote from '@tiptap/extension-blockquote';
import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import { ListKit } from '@tiptap/extension-list';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { describe, expect, it } from 'vitest';
import { renderTiptapEditor } from '../../../../../tests/editor';
import { Details } from '../../../details';
import { DetailsContent } from '../../../details/content';
import { DetailsSummary } from '../../../details/summary';
import Heading from '../../../heading';
import { CodeBlockFileName } from '../../code-block-file-name';
import { DiffCodeBlock } from '../../diff-code-block';
import { DiffCodeLine } from '../../diff-code-block/diff-code-line';
import { CodeBlockContainer } from '../../index';
import { CodeBlock } from '../index';

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

describe('コマンド', () => {
  describe('setAllSelectionInCodeBlock', () => {
    it('コードブロック全体を選択できる', () => {
      const editor = renderTiptapEditor({
        extensions: baseExtensions,
        content:
          '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div><pre><code class="language-javascript">console.log("hello");</code></pre></div>',
      });

      // コードブロック内にカーソルを配置
      editor.commands.setTextSelection(5);

      // コードブロック全体を選択
      editor.commands.setAllSelectionInCodeBlock();

      const { from, to } = editor.state.selection;

      expect(from).toBe(4);
      expect(to).toBe(25);
    });
  });

  describe('setCodeBlockContainer', () => {
    it('段落をコードブロックに変換できる', () => {
      const editor = renderTiptapEditor({
        extensions: baseExtensions,
        content: '<p>console.log("hello");</p>',
      });

      // 段落を選択
      editor.commands.setTextSelection(1);

      // コードブロックに変換
      editor.commands.setCodeBlockContainer({ language: 'javascript' });

      const docString = editor.state.doc.toString();
      expect(docString).toBe(
        'doc(codeBlockContainer(codeBlockFileName, codeBlock("console.log(\\"hello\\");")))'
      );
    });

    it('改行ありの段落を保持したまま呼び出せる', () => {
      const editor = renderTiptapEditor({
        extensions: baseExtensions,
        content: '<p>console.log("hello");<br>console.log("world");</p>',
      });

      // 段落を選択
      editor.commands.setTextSelection(1);

      // コードブロックに変換
      editor.commands.setCodeBlockContainer({ language: 'javascript' });

      const docString = editor.state.doc.toString();
      expect(docString).toBe(
        'doc(codeBlockContainer(codeBlockFileName, codeBlock("console.log(\\"hello\\");\\nconsole.log(\\"world\\");")))'
      );
    });

    it('見出しの中で呼び出せる', () => {
      const editor = renderTiptapEditor({
        extensions: [...baseExtensions, Heading],
        content: '<h1>見出しの中</h1>',
      });

      editor.commands.setTextSelection(1);
      const result = editor.commands.setCodeBlockContainer({
        language: 'plaintext',
      });

      expect(result).toBe(true);
    });

    it('引用の中で呼び出せる', () => {
      const editor = renderTiptapEditor({
        extensions: [...baseExtensions, Blockquote],
        content: '<blockquote>引用の中</blockquote>',
      });

      editor.commands.setTextSelection(1);
      const result = editor.commands.setCodeBlockContainer({
        language: 'plaintext',
      });

      expect(result).toBe(true);
    });

    it('リストで呼び出せない', () => {
      const editor = renderTiptapEditor({
        extensions: [...baseExtensions, ListKit],
        content: '<ul><li><p>リストの中</p></li></ul>',
      });

      editor.commands.setTextSelection(4);
      const result = editor.commands.setCodeBlockContainer({
        language: 'plaintext',
      });

      expect(result).toBe(false);
    });

    it('メッセージの中で呼び出せる', () => {
      const editor = renderTiptapEditor({
        extensions: baseExtensions,
        content:
          '<aside class="msg"><div class="msg-content"><p>メッセージ</p></div></aside>',
      });

      editor.commands.setTextSelection(3);
      const result = editor.commands.setCodeBlockContainer({
        language: 'plaintext',
      });

      expect(result).toBe(true);
    });

    it('コードブロックのファイル名とコンテンツの中で呼び出せない', () => {
      const editor = renderTiptapEditor({
        extensions: [
          ...baseExtensions,
          CodeBlock,
          CodeBlockContainer,
          CodeBlockFileName,
          DiffCodeBlock,
          DiffCodeLine,
        ],
        content:
          '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div><pre><code class="language-javascript">console.log("hello");</code></pre></div>',
      });

      editor.commands.setTextSelection(2);
      const result = editor.commands.setCodeBlockContainer({
        language: 'plaintext',
      });

      editor.commands.setTextSelection(5);
      const result2 = editor.commands.setCodeBlockContainer({
        language: 'plaintext',
      });

      expect(result).toBe(false);
      expect(result2).toBe(false);
    });

    it('差分コードブロックのファイル名とコンテンツの中で呼び出せない', () => {
      const editor = renderTiptapEditor({
        extensions: [
          ...baseExtensions,
          CodeBlock,
          CodeBlockContainer,
          CodeBlockFileName,
          DiffCodeBlock,
          DiffCodeLine,
        ],
        content: `<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div>
          <pre><code class="language-diff diff-highlight"><span>Text</span></code></pre></div>`,
      });

      editor.commands.setTextSelection(2);
      const result = editor.commands.setCodeBlockContainer({
        language: 'plaintext',
      });

      editor.commands.setTextSelection(5);
      const result2 = editor.commands.setCodeBlockContainer({
        language: 'plaintext',
      });

      expect(result).toBe(false);
      expect(result2).toBe(false);
    });

    it('アコーディオンのサマリーで呼べない。コンテンツで呼べる', () => {
      const editor = renderTiptapEditor({
        extensions: [
          ...baseExtensions,
          Details,
          DetailsSummary,
          DetailsContent,
        ],
        content:
          '<details><summary>サマリー</summary><div>コンテンツ</div></details>',
      });

      editor.commands.setTextSelection(10);
      const result = editor.commands.setCodeBlockContainer({
        language: 'plaintext',
      });

      editor.commands.setTextSelection(3);
      const result2 = editor.commands.setCodeBlockContainer({
        language: 'plaintext',
      });

      expect(result).toBe(true);
      expect(result2).toBe(false);
    });

    it('存在しない言語を指定するとplaintextになる', () => {
      const editor = renderTiptapEditor({
        extensions: baseExtensions,
        content: '<p>console.log("hello");</p>',
      });

      // 段落を選択
      editor.commands.setTextSelection(1);

      // 存在しない言語でコードブロックに変換
      editor.commands.setCodeBlockContainer({
        language: 'nonexistent-language',
      });

      const codeBlock = editor.$node('codeBlock');
      expect(codeBlock?.node.attrs.language).toBe('plaintext');
    });
  });

  describe('unsetCodeBlockContainer', () => {
    it('コードブロックを段落に戻せる', () => {
      const editor = renderTiptapEditor({
        extensions: baseExtensions,
        content:
          '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div><pre><code class="language-javascript">console.log("hello");</code></pre></div>',
      });

      // コードブロック内にカーソルを配置
      editor.commands.setTextSelection(2);

      // コードブロックを解除
      editor.commands.unsetCodeBlockContainer();

      const docString = editor.state.doc.toString();
      expect(docString).toBe('doc(paragraph("console.log(\\"hello\\");"))');
    });
  });
});
