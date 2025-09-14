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

describe('HTMLのパース', () => {
  it('preタグを差分コードブロックノードとしてパースできる', () => {
    const editor = renderTiptapEditor({
      extensions: baseExtensions,
      content: `<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div>
      <pre><code class="language-diff-javascript diff-highlight"><span>console.log("hello");</span></code></pre></div>`,
    });

    const docString = editor.state.doc.toString();
    const $node = editor.$node('diffCodeBlock', {
      language: 'javascript',
    });

    expect(docString).toBe(
      'doc(codeBlockContainer(codeBlockFileName, diffCodeBlock(diffCodeLine("console.log(\\"hello\\");"))))'
    );
    expect($node).not.toBeNull();
  });

  it('言語名とファイル名ありの差分preタグをパースできる', () => {
    const editor = renderTiptapEditor({
      extensions: baseExtensions,
      content: `<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename">example.ts</span></div>
      <pre><code class="language-diff-python diff-highlight"><span>import os</span></code></pre></div>`,
    });

    const docString = editor.state.doc.toString();
    const $node = editor.$node('diffCodeBlock', {
      language: 'python',
    });

    expect(docString).toBe(
      'doc(codeBlockContainer(codeBlockFileName("example.ts"), diffCodeBlock(diffCodeLine("import os"))))'
    );
    expect($node).not.toBeNull();
  });

  it('diff言語をパースできる', () => {
    const editor = renderTiptapEditor({
      extensions: baseExtensions,
      content: `<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename">example.ts</span></div>
      <pre><code class="language-diff diff-highlight"><span>const a = 1;</span></code></pre></div>`,
    });

    const docString = editor.state.doc.toString();
    const $node = editor.$node('diffCodeBlock', {
      language: 'plaintext',
    });

    expect(docString).toBe(
      'doc(codeBlockContainer(codeBlockFileName("example.ts"), diffCodeBlock(diffCodeLine("const a = 1;"))))'
    );
    expect($node).not.toBeNull();
  });

  it('複数行でもパースできる', () => {
    const editor = renderTiptapEditor({
      extensions: baseExtensions,
      content: `<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename">example.ts</span></div>
      <pre><code class="language-diff diff-highlight"><span>const a = 1;</span><span>const b = 2;</span></code></pre></div>`,
    });

    const docString = editor.state.doc.toString();
    const $node = editor.$node('diffCodeBlock', {
      language: 'plaintext',
    });

    expect(docString).toBe(
      'doc(codeBlockContainer(codeBlockFileName("example.ts"), diffCodeBlock(diffCodeLine("const a = 1;"), diffCodeLine("const b = 2;"))))'
    );
    expect($node).not.toBeNull();
  });
});
