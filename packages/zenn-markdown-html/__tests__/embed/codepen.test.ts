import { parse } from 'node-html-parser';
import markdownToHtml from '../../src/index';

describe('Codepen埋め込み要素のテスト', () => {
  const validUrl = 'https://codepen.io/examples/pen/test?default-tab=hoge';
  const invalidUrl =
    'https://bad-example.codepen.io/examples/pen/test?default-tab=hoge';

  describe('デフォルトの挙動', () => {
    describe('有効なURLの場合', () => {
      test('<iframe />に変換する', () => {
        const html = markdownToHtml(`@[codepen](${validUrl})`);
        const iframe = parse(html).querySelector(`span.embed-codepen iframe`);
        const passedUrl = validUrl.replace('/pen/', '/embed/');

        expect(iframe?.attributes).toEqual(
          expect.objectContaining({ src: expect.stringContaining(passedUrl) })
        );
      });
    });

    describe('無効なURLの場合', () => {
      test('エラーメッセージを出力する', () => {
        const html = markdownToHtml(`@[codepen](${invalidUrl})`);
        expect(html).toContain('CodePenのURLが不正です');
      });
    });
  });

  describe('customEmbed.codepen()を設定している場合', () => {
    test('渡した関数を実行する', () => {
      const customizeText = 'customized text';
      const mock = jest.fn().mockReturnValue(customizeText);
      const html = markdownToHtml(`@[codepen](${invalidUrl})`, {
        customEmbed: { codepen: mock },
      });

      expect(mock).toBeCalled();
      expect(html.includes(customizeText)).toBe(true);
    });
  });
});
