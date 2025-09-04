import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { describe, expect, it } from 'vitest';
import { fromMarkdown } from '../../../../../lib/from-markdown';
import { markdownSerializer } from '../../../../../lib/to-markdown';
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

describe('マークダウン', () => {
  it('JavaScriptコードブロックをマークダウンに変換できる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content:
        '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div><pre><code class="language-javascript">console.log("hello");</code></pre></div>',
    });

    const markdown = markdownSerializer.serialize(editor.state.doc);
    expect(markdown).toBe('```javascript\nconsole.log("hello");\n```');
  });

  it('言語名なしのコードブロックをマークダウンに変換できる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content:
        '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div><pre><code class="language-plaintext">plaintext code</code></pre></div>',
    });

    const markdown = markdownSerializer.serialize(editor.state.doc);
    expect(markdown).toBe('```plaintext\nplaintext code\n```');
  });

  it('複数行のコードブロックをマークダウンに変換できる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content:
        '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div><pre><code class="language-python">def hello():\n    print("Hello, World!")\n    return True</code></pre></div>',
    });

    const markdown = markdownSerializer.serialize(editor.state.doc);
    expect(markdown).toBe(
      '```python\ndef hello():\n    print("Hello, World!")\n    return True\n```'
    );
  });

  it('マークダウンからコードブロックに変換', () => {
    const markdown = '```javascript\nconsole.log("hello");\n```';

    const html = fromMarkdown(markdown);
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content: html,
    });
    const docString = editor.state.doc.toString();

    expect(docString).toBe(
      'doc(codeBlockContainer(codeBlockFileName, codeBlock("console.log(\\"hello\\");")))'
    );
  });

  it('ファイル名付きマークダウンからコードブロックに変換', () => {
    const markdown = '```javascript:hello.js\nconsole.log("hello");\n```';

    const html = fromMarkdown(markdown);
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content: html,
    });
    const docString = editor.state.doc.toString();

    expect(docString).toBe(
      'doc(codeBlockContainer(codeBlockFileName("hello.js"), codeBlock("console.log(\\"hello\\");")))'
    );
  });
});
