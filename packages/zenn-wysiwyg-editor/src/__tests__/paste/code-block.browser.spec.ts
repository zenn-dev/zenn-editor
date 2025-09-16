import { it, describe, expect } from 'vitest';
import { waitSelectionChange } from '../../tests/dom';
import { renderTiptapEditor } from '../../tests/editor';
import { paste, setClipboardContent } from '../../tests/clipboard';
import { TEST_ALL_EXTENSIONS } from '../../tests/test-extensions';

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
});
