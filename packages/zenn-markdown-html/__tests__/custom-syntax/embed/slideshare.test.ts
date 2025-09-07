import { vi, describe, test, expect } from 'vitest';
import { parse } from 'node-html-parser';
import { markdownToHtml } from '../../../src/index';

describe('SlideShare埋め込み要素のテスト', () => {
  const validToken = 'example-token';
  const invalidToken = '@invalid-token';

  describe('デフォルトの挙動', () => {
    describe('有効なURLの場合', () => {
      test('<iframe />に変換する', () => {
        const html = markdownToHtml(`@[slideshare](${validToken})`);
        const iframe = parse(html).querySelector(
          `span.embed-slideshare iframe`
        );

        expect(iframe?.attributes).toEqual(
          expect.objectContaining({
            src: `https://www.slideshare.net/slideshow/embed_code/key/${validToken}`,
          })
        );
      });
    });

    describe('無効なURLの場合', () => {
      test('エラーメッセージを出力する', () => {
        const html = markdownToHtml(`@[slideshare](${invalidToken})`);
        expect(html).toContain('Slide Shareのkeyが不正です');
      });
    });
  });

  describe('customEmbed.slideshare()を設定している場合', () => {
    test('渡した関数を実行する', () => {
      const customizeText = 'customized text!';
      const mock = vi.fn().mockReturnValue(customizeText);
      const html = markdownToHtml(`@[slideshare](${validToken})`, {
        customEmbed: { slideshare: mock },
      });

      expect(mock).toBeCalled();
      expect(html).toContain(customizeText);
    });
  });
});
