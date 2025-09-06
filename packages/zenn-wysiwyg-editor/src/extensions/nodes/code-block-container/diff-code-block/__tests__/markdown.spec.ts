import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { describe, expect, it } from 'vitest';
import { convertMarkdownToEditable } from '../../../../../lib/from-markdown';
import { markdownSerializer } from '../../../../../lib/to-markdown';
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

describe('マークダウン', () => {
  it('diff-javascriptコードブロックをマークダウンに変換できる', () => {
    const editor = renderTiptapEditor({
      extensions: baseExtensions,
      content: `<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div>
        <pre><code class="language-diff-javascript diff-highlight"><span>console.log("hello");</span></code></pre></div>`,
    });

    const markdown = markdownSerializer.serialize(editor.state.doc);
    expect(markdown).toBe('```diff javascript\nconsole.log("hello");\n```');
  });

  it('diffコードブロックをマークダウンに変換できる', () => {
    const editor = renderTiptapEditor({
      extensions: baseExtensions,
      content: `<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div>
        <pre><code class="language-diff diff-highlight"><span>plaintext code</span></code></pre></div>`,
    });

    const markdown = markdownSerializer.serialize(editor.state.doc);
    expect(markdown).toBe('```diff\nplaintext code\n```');
  });

  it('複数行のコードブロックをマークダウンに変換できる', () => {
    const editor = renderTiptapEditor({
      extensions: baseExtensions,
      content: `<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div>
        <pre><code class="language-diff diff-highlight"><span>plaintext code</span><span></span><span>plaintext code</span></code></pre></div>`,
    });

    const markdown = markdownSerializer.serialize(editor.state.doc);
    expect(markdown).toBe('```diff\nplaintext code\n\nplaintext code\n```');
  });

  it('マークダウンからコードブロックに変換', () => {
    const markdown = '```diff javascript\nconsole.log("hello");\n```';

    const html = convertMarkdownToEditable(markdown);
    const editor = renderTiptapEditor({
      extensions: baseExtensions,
      content: html,
    });
    const docString = editor.state.doc.toString();

    expect(docString).toBe(
      'doc(codeBlockContainer(codeBlockFileName, diffCodeBlock(diffCodeLine("console.log(\\"hello\\");"))))'
    );
  });

  it('ファイル名付きマークダウンからコードブロックに変換', () => {
    const markdown = '```diff javascript:hello.js\nconsole.log("hello");\n```';

    const html = convertMarkdownToEditable(markdown);
    const editor = renderTiptapEditor({
      extensions: baseExtensions,
      content: html,
    });
    const docString = editor.state.doc.toString();

    expect(docString).toBe(
      'doc(codeBlockContainer(codeBlockFileName("hello.js"), diffCodeBlock(diffCodeLine("console.log(\\"hello\\");"))))'
    );
  });
});
