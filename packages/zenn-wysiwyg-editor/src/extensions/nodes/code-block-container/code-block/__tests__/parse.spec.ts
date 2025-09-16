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

describe('HTMLのパース', () => {
  it('言語名ありのpreタグをコードブロックノードとしてパースできる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content:
        '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div><pre><code class="language-javascript">console.log("hello");</code></pre></div>',
    });

    const docString = editor.state.doc.toString();

    expect(docString).toBe(
      'doc(codeBlockContainer(codeBlockFileName, codeBlock("console.log(\\"hello\\");")))'
    );
  });

  it('言語名なしのpreタグをパースできる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content:
        '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div><pre><code>plaintext code</code></pre></div>',
    });

    const docString = editor.state.doc.toString();
    expect(docString).toBe(
      'doc(codeBlockContainer(codeBlockFileName, codeBlock("plaintext code")))'
    );
  });

  it('言語とファイル名ありのpreタグをパースできる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content:
        '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename">example.ts</span></div><pre><code class="language-typescript">const a = 1;</code></pre></div>',
    });

    const docString = editor.state.doc.toString();
    expect(docString).toBe(
      'doc(codeBlockContainer(codeBlockFileName("example.ts"), codeBlock("const a = 1;")))'
    );
  });

  it('サポートされていない言語はplaintextにフォールバックされる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content:
        '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div><pre><code class="language-unknown-language">some code content</code></pre></div>',
    });

    const docString = editor.state.doc.toString();
    expect(docString).toBe(
      'doc(codeBlockContainer(codeBlockFileName, codeBlock("some code content")))'
    );

    const $codeBlockNode = editor.$node('codeBlock');
    expect($codeBlockNode?.node.attrs.language).toBe('plaintext');
  });
});
