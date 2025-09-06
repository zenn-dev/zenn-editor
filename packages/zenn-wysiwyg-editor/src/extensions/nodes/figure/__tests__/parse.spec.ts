import Document from '@tiptap/extension-document';
import Paragraph from '@tiptap/extension-paragraph';
import Text from '@tiptap/extension-text';
import { describe, expect, it } from 'vitest';
import LakeImage from '../../../../tests/assets/sikotuko.jpeg';
import { renderTiptapEditor } from '../../../../tests/editor';
import Figure from '..';
import { Caption } from '../caption';
import { Image } from '../image';

const basicExtension = [Document, Paragraph, Text, Figure, Image, Caption];

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
});
