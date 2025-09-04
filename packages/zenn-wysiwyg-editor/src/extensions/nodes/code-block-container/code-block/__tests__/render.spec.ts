import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { describe, expect, it } from 'vitest';
import { renderTiptapEditor } from '../../../../../tests/editor';
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

describe('HTMLのレンダリング', () => {
  it('JavaScriptコードブロックが正しいHTMLでレンダリングされる', () => {
    const content =
      '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div><pre><code class="language-javascript">console.log("hello");</code></pre></div>';
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content,
    });

    const html = editor.getHTML();
    expect(content).toBe(html);
  });

  it('言語名なしのコードブロックが正しいHTMLでレンダリングされる', () => {
    const content =
      '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div><pre><code class="language-plaintext">plaintext code</code></pre></div>';
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content,
    });

    const html = editor.getHTML();
    expect(html).toBe(content);
  });
});
