import { it, describe, expect } from 'vitest';
import Document from '@tiptap/extension-document';
import HardBreak from '@tiptap/extension-hard-break';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { waitSelectionChange } from '../tests/dom';
import { renderTiptapEditor } from '../tests/editor';
import { CodeBlockFileName } from '../extensions/nodes/code-block-container/code-block-file-name';
import { DiffCodeBlock } from '../extensions/nodes/code-block-container/diff-code-block';
import { DiffCodeLine } from '../extensions/nodes/code-block-container/diff-code-block/diff-code-line';
import { CodeBlockContainer } from '../extensions/nodes/code-block-container/index';
import { CodeBlock } from '../extensions/nodes/code-block-container/code-block/index';
import { paste, setClipboardContent } from '../tests/clipboard';

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

describe('paste', () => {
  it('テキストの貼り付け', async () => {
    // テストの実装
    const editor = renderTiptapEditor({
      content:
        '<div class="code-block-container"><div class="code-block-filename-container"><span class="code-block-filename"></span></div><pre><code class="language-javascript"></code></pre></div>',
      extensions: basicExtension,
    });

    await setClipboardContent('Text');
    await waitSelectionChange(() => {
      editor.chain().focus().setTextSelection(4).run();
    });
    await paste();

    const docString = editor.state.doc.toString();
    expect(docString).toBe(
      'doc(codeBlockContainer(codeBlockFileName, codeBlock("Text")))'
    );
  });
});
