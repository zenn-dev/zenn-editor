/**
 * Vitest はファイル単位で並列実行をする。クリップボードは共有メモリのため、ペーストのテストは1つのファイルにまとめる。
 * 参考：https://vitest.dev/guide/parallelism
 */

import { it, describe, expect } from 'vitest';
import { waitSelectionChange } from '../tests/dom';
import { renderTiptapEditor } from '../tests/editor';
import { paste, setClipboardContent } from '../tests/clipboard';
import { TEST_ALL_EXTENSIONS } from '../tests/test-extensions';
import LakeImage from '../tests/assets/sikotuko.jpeg';

describe('paste (codeBlock)', () => {
  it('テキストの貼り付け', async () => {
    const editor = renderTiptapEditor({
      content:
        '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div><pre><code class="language-javascript"></code></pre></div>',
      extensions: TEST_ALL_EXTENSIONS,
    });

    await setClipboardContent('Text');
    await waitSelectionChange(() => {
      editor.chain().focus().setTextSelection(4).run();
    });
    await paste();

    const docString = editor.state.doc.toString();
    expect(docString).toBe(
      'doc(codeBlockContainer(codeBlockFileName, codeBlock("Text")), paragraph)'
    );
  });

  it('URLの貼り付け', async () => {
    const editor = renderTiptapEditor({
      content:
        '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div><pre><code class="language-javascript"></code></pre></div>',
      extensions: TEST_ALL_EXTENSIONS,
    });

    await setClipboardContent('http://example.com');
    await waitSelectionChange(() => {
      editor.chain().focus().setTextSelection(4).run();
    });
    await paste();

    const docString = editor.state.doc.toString();
    expect(docString).toBe(
      'doc(codeBlockContainer(codeBlockFileName, codeBlock("http://example.com")), paragraph)'
    );
  });

  it('マークダウン形式画像の貼り付け', async () => {
    const editor = renderTiptapEditor({
      content:
        '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div><pre><code class="language-javascript"></code></pre></div>',
      extensions: TEST_ALL_EXTENSIONS,
    });

    const fullImageUrl = `${location.origin}${LakeImage}`;
    await setClipboardContent(`![支笏湖](${fullImageUrl})`);
    await waitSelectionChange(() => {
      editor.chain().focus().setTextSelection(4).run();
    });
    await paste();

    const docString = editor.state.doc.toString();
    expect(docString).toBe(
      `doc(codeBlockContainer(codeBlockFileName, codeBlock("![支笏湖](${fullImageUrl})")), paragraph)`
    );
  });
});

describe('paste (diffCodeBlock)', () => {
  it('テキストの貼り付け', async () => {
    const editor = renderTiptapEditor({
      content:
        '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div><pre><code class="language-diff-javascript diff-highlight"></code></pre></div>',
      extensions: TEST_ALL_EXTENSIONS,
    });

    await setClipboardContent('console.log("hello");');
    await waitSelectionChange(() => {
      editor.chain().focus().setTextSelection(5).run();
    });
    await paste();

    const docString = editor.state.doc.toString();
    expect(docString).toBe(
      'doc(codeBlockContainer(codeBlockFileName, diffCodeBlock(diffCodeLine("console.log(\\"hello\\");"))), paragraph)'
    );
  });

  it('複数行テキストの貼り付け', async () => {
    const editor = renderTiptapEditor({
      content:
        '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div><pre><code class="language-diff diff-highlight"></code></pre></div>',
      extensions: TEST_ALL_EXTENSIONS,
    });

    await setClipboardContent('line1\nline2\nline3');
    await waitSelectionChange(() => {
      editor.chain().focus().setTextSelection(5).run();
    });
    await paste();

    const docString = editor.state.doc.toString();
    expect(docString).toBe(
      'doc(codeBlockContainer(codeBlockFileName, diffCodeBlock(diffCodeLine("line1"), diffCodeLine("line2"), diffCodeLine("line3"))), paragraph)'
    );
  });

  it('空行を含む複数行テキストの貼り付け', async () => {
    const editor = renderTiptapEditor({
      content:
        '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div><pre><code class="language-diff-typescript diff-highlight"></code></pre></div>',
      extensions: TEST_ALL_EXTENSIONS,
    });

    await setClipboardContent('function test() {\n\n  return true;\n}');
    await waitSelectionChange(() => {
      editor.chain().focus().setTextSelection(5).run();
    });
    await paste();

    const docString = editor.state.doc.toString();
    expect(docString).toBe(
      'doc(codeBlockContainer(codeBlockFileName, diffCodeBlock(diffCodeLine("function test() {"), diffCodeLine, diffCodeLine("  return true;"), diffCodeLine("}"))), paragraph)'
    );
  });

  it('URLの貼り付け', async () => {
    const editor = renderTiptapEditor({
      content:
        '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div><pre><code class="language-diff diff-highlight"></code></pre></div>',
      extensions: TEST_ALL_EXTENSIONS,
    });

    await setClipboardContent('https://example.com/api/endpoint');
    await waitSelectionChange(() => {
      editor.chain().focus().setTextSelection(5).run();
    });
    await paste();

    const docString = editor.state.doc.toString();
    expect(docString).toBe(
      'doc(codeBlockContainer(codeBlockFileName, diffCodeBlock(diffCodeLine("https://example.com/api/endpoint"))), paragraph)'
    );
  });

  it('差分形式のテキストの貼り付け', async () => {
    const editor = renderTiptapEditor({
      content:
        '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div><pre><code class="language-diff-javascript diff-highlight"></code></pre></div>',
      extensions: TEST_ALL_EXTENSIONS,
    });

    await setClipboardContent(
      '+ console.log("added");\n- console.log("removed");'
    );
    await waitSelectionChange(() => {
      editor.chain().focus().setTextSelection(5).run();
    });
    await paste();

    const docString = editor.state.doc.toString();
    expect(docString).toBe(
      'doc(codeBlockContainer(codeBlockFileName, diffCodeBlock(diffCodeLine("+ console.log(\\"added\\");"), diffCodeLine("- console.log(\\"removed\\");"))), paragraph)'
    );
  });

  it('マークダウン形式画像の貼り付け', async () => {
    const editor = renderTiptapEditor({
      content:
        '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div><pre><code class="language-diff-javascript diff-highlight"></code></pre></div>',
      extensions: TEST_ALL_EXTENSIONS,
    });

    const fullImageUrl = `${location.origin}${LakeImage}`;
    await setClipboardContent(`![支笏湖](${fullImageUrl})`);
    await waitSelectionChange(() => {
      editor.chain().focus().setTextSelection(5).run();
    });
    await paste();

    const docString = editor.state.doc.toString();
    expect(docString).toBe(
      `doc(codeBlockContainer(codeBlockFileName, diffCodeBlock(diffCodeLine("![支笏湖](${fullImageUrl})"))), paragraph)`
    );
  });
});

describe('paste (figure)', () => {
  it('画像URLの貼り付け', async () => {
    const editor = renderTiptapEditor({
      content: '<p></p>',
      extensions: TEST_ALL_EXTENSIONS,
    });

    const fullImageUrl = `${location.origin}${LakeImage}`;
    await setClipboardContent(fullImageUrl);
    await waitSelectionChange(() => {
      editor.chain().focus().setTextSelection(1).run();
    });
    await paste();

    const docString = editor.state.doc.toString();
    expect(docString).toBe('doc(figure(image, caption), paragraph)');
    expect(editor.state.doc.firstChild?.firstChild?.attrs.src).toBe(
      fullImageUrl
    );
  });

  it('markdown形式の画像の貼り付け', async () => {
    const editor = renderTiptapEditor({
      content: '<p></p>',
      extensions: TEST_ALL_EXTENSIONS,
    });

    const fullImageUrl = `${location.origin}${LakeImage}`;
    await setClipboardContent(`![支笏湖](${fullImageUrl})`);
    await waitSelectionChange(() => {
      editor.chain().focus().setTextSelection(1).run();
    });
    await paste();

    const docString = editor.state.doc.toString();
    expect(docString).toBe('doc(figure(image, caption), paragraph)');
    expect(editor.state.doc.firstChild?.firstChild?.attrs).toEqual({
      src: fullImageUrl,
      alt: '支笏湖',
      width: null,
      isLoadingError: false,
    });
  });

  it('範囲選択時の画像URL貼り付けではリンクが作成される', async () => {
    const editor = renderTiptapEditor({
      content: '<p>selected text</p>',
      extensions: TEST_ALL_EXTENSIONS,
    });

    const fullImageUrl = `${location.origin}${LakeImage}`;
    await setClipboardContent(fullImageUrl);
    await waitSelectionChange(() => {
      editor
        .chain()
        .focus()
        .setTextSelection({
          from: 1,
          to: 14,
        })
        .run();
    });
    await paste();

    const docString = editor.state.doc.toString();
    expect(docString).toBe(`doc(paragraph(link("selected text")))`);
  });
});
