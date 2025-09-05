import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { describe, expect, it } from 'vitest';
import { convertMarkdownToEditable } from '../../../../lib/from-markdown';
import { markdownSerializer } from '../../../../lib/to-markdown';
import { renderTiptapEditor } from '../../../../tests/editor';
import { Details } from '..';
import { DetailsContent } from '../content';
import { DetailsSummary } from '../summary';

const basicExtension = [
  Document,
  Paragraph,
  Text,
  Details,
  DetailsContent,
  DetailsSummary,
];

describe('マークダウン', () => {
  it('アコーディオンのマークダウン記法で出力できる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content:
        '<details><summary>summary</summary><div class="details-content"><p>テキスト</p></div></details>',
    });

    const markdown = markdownSerializer.serialize(editor.state.doc);

    expect(markdown).toBe(':::details summary\nテキスト\n:::');
  });

  it('アコーディオンのネストをマークダウン記法に出力できる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content: `<details><summary>summary</summary><div class="details-content">
        <p>テキスト</p>
            <details><summary>nest summary</summary><div class="details-content">
                <p>ネスト</p>
            </div></details>
        </div>
        </details>`,
    });

    const markdown = markdownSerializer.serialize(editor.state.doc);

    expect(markdown).toBe(
      '::::details summary\nテキスト\n\n:::details nest summary\nネスト\n:::\n::::'
    );
  });

  it('マークダウンからアコーディオンをパースできる', () => {
    const markdown = ':::details summary\nテキスト\n\n:::';
    const html = convertMarkdownToEditable(markdown);

    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content: html,
    });

    const docString = editor.state.doc.toString();

    expect(docString).toBe(
      'doc(details(detailsSummary("summary"), detailsContent(paragraph("テキスト"))))'
    );
  });
});
