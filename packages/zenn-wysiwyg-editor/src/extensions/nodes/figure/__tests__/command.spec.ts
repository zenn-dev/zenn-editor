import Blockquote from '@tiptap/extension-blockquote';
import Document from '@tiptap/extension-document';
import { ListKit } from '@tiptap/extension-list';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { describe, expect, it } from 'vitest';
import LakeImage from '../../../../tests/assets/sikotuko.jpeg';
import { renderTiptapEditor } from '../../../../tests/editor';
import { CodeBlockContainer } from '../../code-block-container';
import { CodeBlock } from '../../code-block-container/code-block';
import { CodeBlockFileName } from '../../code-block-container/code-block-file-name';
import { DiffCodeBlock } from '../../code-block-container/diff-code-block';
import { DiffCodeLine } from '../../code-block-container/diff-code-block/diff-code-line';
import { Details } from '../../details';
import { DetailsContent } from '../../details/content';
import { DetailsSummary } from '../../details/summary';
import Heading from '../../heading';
import Figure from '..';
import { Caption } from '../caption';
import { Image } from '../image';

const basicExtension = [Document, Paragraph, Text, Figure, Image, Caption];

const baseExtensions = [Document, Paragraph, Text, Figure, Image, Caption];

describe('コマンド', () => {
  describe('setFigure', () => {
    it('setFigureコマンドで画像とキャプション付きのFigureノードを挿入できる', () => {
      const editor = renderTiptapEditor({
        extensions: basicExtension,
        content: '<p></p>',
      });

      editor.commands.setFigure({
        src: LakeImage,
        alt: '支笏湖',
        caption: '美しい支笏湖',
      });

      const docString = editor.state.doc.toString();
      expect(docString).toBe('doc(figure(image, caption("美しい支笏湖")))');

      const figureNode = editor.state.doc.child(0);
      expect(figureNode?.firstChild?.attrs).toEqual({
        src: LakeImage,
        alt: '支笏湖',
        width: null,
      });
    });

    it('setFigureコマンドでキャプションなしのFigureノードを挿入できる', () => {
      const editor = renderTiptapEditor({
        extensions: baseExtensions,
        content: '<p></p>',
      });

      editor.commands.setFigure({
        src: LakeImage,
        alt: '支笏湖',
      });

      const docString = editor.state.doc.toString();
      expect(docString).toBe('doc(figure(image, caption))');

      const figureNode = editor.state.doc.child(0);
      expect(figureNode?.firstChild?.attrs).toEqual({
        src: LakeImage,
        alt: '支笏湖',
        width: null,
      });
    });

    it('見出しの中で呼び出せる', () => {
      const editor = renderTiptapEditor({
        extensions: [...baseExtensions, Heading],
        content: '<h1>見出しの中</h1>',
      });

      editor.commands.setTextSelection(1);
      const result = editor.commands.setFigure({ src: '' });

      expect(result).toBe(true);
    });

    it('引用の中で呼び出せる', () => {
      const editor = renderTiptapEditor({
        extensions: [...baseExtensions, Blockquote],
        content: '<blockquote>引用の中</blockquote>',
      });

      editor.commands.setTextSelection(1);
      const result = editor.commands.setFigure({ src: '' });

      expect(result).toBe(true);
    });

    it('リストで呼び出せない', () => {
      const editor = renderTiptapEditor({
        extensions: [...baseExtensions, ListKit],
        content: '<ul><li><p>リストの中</p></li></ul>',
      });

      editor.commands.setTextSelection(4);
      const result = editor.commands.setFigure({ src: '' });

      expect(result).toBe(false);
    });

    it('メッセージの中で呼び出せる', () => {
      const editor = renderTiptapEditor({
        extensions: baseExtensions,
        content:
          '<aside class="msg"><div class="msg-content"><p>メッセージ</p></div></aside>',
      });

      editor.commands.setTextSelection(3);
      const result = editor.commands.setFigure({ src: '' });

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
      const result = editor.commands.setFigure({ src: '' });

      editor.commands.setTextSelection(5);
      const result2 = editor.commands.setFigure({ src: '' });

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
      const result = editor.commands.setFigure({ src: '' });

      editor.commands.setTextSelection(5);
      const result2 = editor.commands.setFigure({ src: '' });

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
      const result = editor.commands.setFigure({ src: '' });

      editor.commands.setTextSelection(3);
      const result2 = editor.commands.setFigure({ src: '' });

      expect(result).toBe(true);
      expect(result2).toBe(false);
    });
  });

  describe('clearFigure', () => {
    it('Figureノードを削除できる', () => {
      const editor = renderTiptapEditor({
        extensions: [Document, Paragraph, Text, Figure, Image, Caption],
        content: `<p><img src="${LakeImage}" alt="支笏湖"><em>支笏湖</em></p>`,
      });

      editor.commands.setTextSelection(2);
      editor.commands.clearFigure();

      const docString = editor.state.doc.toString();
      expect(docString).toBe('doc(paragraph)');
    });

    it('Figureノード外では動作しない', () => {
      const editor = renderTiptapEditor({
        extensions: [Document, Paragraph, Text, Figure, Image, Caption],
        content: `<p>普通の段落</p><p><img src="${LakeImage}" alt="支笏湖"><em>支笏湖</em></p>`,
      });

      editor.commands.setTextSelection(2);
      const result = editor.commands.clearFigure();

      expect(result).toBe(false);
      const docString = editor.state.doc.toString();
      expect(docString).toBe(
        'doc(paragraph("普通の段落"), figure(image, caption("支笏湖")))'
      );
    });
  });
});
