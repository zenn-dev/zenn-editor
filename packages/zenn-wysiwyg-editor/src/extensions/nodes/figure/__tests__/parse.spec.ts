import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { describe, expect, it } from 'vitest';
import LakeImage from '../../../../tests/assets/sikotuko.jpeg';
import { renderTiptapEditor } from '../../../../tests/editor';
import { Link } from '../../../marks/link';
import Figure from '..';
import { Caption } from '../caption';
import { Image } from '../image';

const basicExtension = [
  Document,
  Paragraph,
  Text,
  Figure,
  Image,
  Caption,
  Link,
];

describe('HTMLのパース', () => {
  it('画像タグをFigureノードとしてパースできる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content: `<p><img src="${LakeImage}" alt="支笏湖"><em>支笏湖</em></p>`,
    });

    const docString = editor.state.doc.toString();

    expect(docString).toBe('doc(figure(image, caption("支笏湖")))');
    expect(editor.state.doc.firstChild?.firstChild?.attrs).toEqual({
      src: LakeImage,
      alt: '支笏湖',
      width: null,
      isLoadingError: false,
    });
  });

  it('改行付き画像タグをFigureノードとしてパースできる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content: `<p><img src="${LakeImage}" alt="支笏湖"><br/><em>支笏湖</em></p>`,
    });

    const docString = editor.state.doc.toString();

    expect(docString).toBe('doc(figure(image, caption("支笏湖")))');
    expect(editor.state.doc.firstChild?.firstChild?.attrs).toEqual({
      src: LakeImage,
      alt: '支笏湖',
      width: null,
      isLoadingError: false,
    });
  });

  it('キャプションが空の画像タグをFigureノードとしてパースできる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content: `<p><img src="${LakeImage}" alt="支笏湖"><br/><em></em></p>`,
    });

    const docString = editor.state.doc.toString();

    expect(docString).toBe('doc(figure(image, caption))');
    expect(editor.state.doc.firstChild?.firstChild?.attrs).toEqual({
      src: LakeImage,
      alt: '支笏湖',
      width: null,
      isLoadingError: false,
    });
  });

  it('リンク付き画像をFigureノードとしてパースできる', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content: `<p><a href="https://example.com"><img src="${LakeImage}" alt="支笏湖"></a></p>`,
    });

    const imageNode = editor.state.doc.firstChild?.firstChild;
    expect(imageNode?.attrs).toEqual({
      src: LakeImage,
      alt: '支笏湖',
      width: null,
      isLoadingError: false,
    });

    // 画像にLinkマークが付いていることを確認
    expect(imageNode?.marks).toHaveLength(1);
    expect(imageNode?.marks[0].type.name).toBe('link');
    expect(imageNode?.marks[0].attrs.href).toBe('https://example.com');

    // キャプションがdiplay: noneになっていることを確認
    const captionDom = editor.view.dom.querySelector('em');
    expect(captionDom).not.toBeNull();
    expect(captionDom?.style.display).toBe('none');
  });
  ``;
  it('通常の画像のキャプションは表示されている', () => {
    const editor = renderTiptapEditor({
      extensions: basicExtension,
      content: `<p><img src="${LakeImage}" alt="支笏湖"><em>支笏湖</em></p>`,
    });

    // キャプションがdiplay: noneになっていることを確認
    const captionDom = editor.view.dom.querySelector('em');
    expect(captionDom?.style.display).not.toBe('none');
  });
});
