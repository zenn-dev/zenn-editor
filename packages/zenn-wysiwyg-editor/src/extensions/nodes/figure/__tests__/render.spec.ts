import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { describe, expect, it } from 'vitest';
import LakeImage from '../../../../tests/assets/sikotuko.jpeg';
import { renderTiptapEditor } from '../../../../tests/editor';
import Figure from '..';
import { Caption } from '../caption';
import { Image } from '../image';
import { Link } from '../../../marks/link';

const basicExtension = [
  Document,
  Paragraph,
  Text,
  Figure,
  Image,
  Caption,
  Link,
];

describe('HTMLのパース・レンダリング', () => {
  it('Figureノードが正しいHTMLでレンダリングされる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content: `<p><img src="${LakeImage}" alt="支笏湖"><em>支笏湖</em></p>`,
    });

    const html = editor.getHTML();
    expect(html).toBe(
      `<p><img src="${LakeImage}" alt="支笏湖" class="md-img"><em>支笏湖</em></p>`
    );
  });

  it('リンク付き画像が正しいHTMLでレンダリングされる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content: `<p><a href="https://example.com"><img src="${LakeImage}" alt="支笏湖"></a><em></em></p>`,
    });

    const html = editor.getHTML();
    expect(html).toBe(
      `<p><a target="_blank" rel="noopener noreferrer nofollow" href="https://example.com"><img src="${LakeImage}" alt="支笏湖" class="md-img"></a><em></em></p>`
    );
  });
});
