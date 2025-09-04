import Blockquote from '@tiptap/extension-blockquote';
import Document from '@tiptap/extension-document';
import { ListKit } from '@tiptap/extension-list';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { describe, expect, it } from 'vitest';
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
import { Message } from '../message';
import { MessageContent } from '../message-content';

const baseExtensions = [Document, Paragraph, Text, Message, MessageContent];

describe('コマンド', () => {
  describe('setMessage', () => {
    it('段落をメッセージノードに変換できる', () => {
      const editor = renderTiptapEditor({
        extensions: baseExtensions,
        content: '<p>通常の段落</p>',
      });

      editor.commands.setTextSelection({ from: 1, to: 6 });
      editor.commands.setMessage({ type: 'message' });

      const docString = editor.state.doc.toString();

      expect(docString).toBe(
        'doc(message(messageContent(paragraph("通常の段落"))))'
      );
    });

    it('段落を跨ぐ場合にメッセージノードに変換できる', () => {
      const editor = renderTiptapEditor({
        extensions: baseExtensions,
        content: '<p>段落1</p><p>段落2</p>',
      });

      // 段落を跨いでメッセージに変換
      editor.commands.setTextSelection({ from: 2, to: 7 });
      editor.commands.setMessage({ type: 'alert' });

      const docString = editor.state.doc.toString();

      expect(docString).toBe(
        'doc(message(messageContent(paragraph("段落1"), paragraph("段落2"))))'
      );
    });

    it('見出しの中で呼び出せる', () => {
      const editor = renderTiptapEditor({
        extensions: [...baseExtensions, Heading],
        content: '<h1>見出しの中</h1>',
      });

      editor.commands.setTextSelection(1);
      const result = editor.commands.setMessage({ type: 'message' });

      expect(result).toBe(true);
    });

    it('引用の中で呼び出せる', () => {
      const editor = renderTiptapEditor({
        extensions: [...baseExtensions, Blockquote],
        content: '<blockquote>引用の中</blockquote>',
      });

      editor.commands.setTextSelection(1);
      const result = editor.commands.setMessage({ type: 'message' });

      expect(result).toBe(true);
    });

    it('リストで呼び出せない', () => {
      const editor = renderTiptapEditor({
        extensions: [...baseExtensions, ListKit],
        content: '<ul><li><p>リストの中</p></li></ul>',
      });

      editor.commands.setTextSelection(4);
      const result = editor.commands.setMessage({ type: 'message' });

      expect(result).toBe(false);
    });

    it('メッセージの中で呼び出せる', () => {
      const editor = renderTiptapEditor({
        extensions: baseExtensions,
        content:
          '<aside class="msg"><div class="msg-content"><p>メッセージ</p></div></aside>',
      });

      editor.commands.setTextSelection(3);
      const result = editor.commands.setMessage({ type: 'message' });

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
      const result = editor.commands.setMessage({ type: 'message' });

      editor.commands.setTextSelection(5);
      const result2 = editor.commands.setMessage({ type: 'message' });

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
      const result = editor.commands.setMessage({ type: 'message' });

      editor.commands.setTextSelection(5);
      const result2 = editor.commands.setMessage({ type: 'message' });

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
      const result = editor.commands.setMessage({ type: 'message' });

      editor.commands.setTextSelection(3);
      const result2 = editor.commands.setMessage({ type: 'message' });

      expect(result).toBe(true);
      expect(result2).toBe(false);
    });
  });

  describe('unsetMessage', () => {
    it('メッセージを通常の段落に戻せる', () => {
      const editor = renderTiptapEditor({
        extensions: baseExtensions,
        content:
          '<aside class="msg alert"><div class="msg-content"><p>メッセージ</p></div></aside>',
      });

      editor.commands.setTextSelection(3);
      editor.commands.unsetMessage();

      const docString = editor.state.doc.toString();

      expect(docString).toBe('doc(paragraph("メッセージ"))');
    });

    it('段落では呼び出せない', () => {
      const editor = renderTiptapEditor({
        extensions: baseExtensions,
        content: '<p>通常の段落</p>',
      });

      editor.commands.setTextSelection(3);
      const result = editor.commands.unsetMessage();

      expect(result).toBe(false);
    });
  });
});
