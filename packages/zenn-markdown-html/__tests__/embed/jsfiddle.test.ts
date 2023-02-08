import { parse } from 'node-html-parser';
import markdownToHtml from '../../src/index';

describe('jsfiddle埋め込み要素のテスト', () => {
  const validUrl = 'https://jsfiddle.net/examples/embedded';
  const invalidUrl = 'https://bad-example.jsfiddle.net/examples/embedded';

  describe('デフォルトの挙動の場合', () => {
    test('@[jsfiddle](...)を<iframe />に変換する', () => {
      const html = markdownToHtml(`@[jsfiddle](${validUrl})`);
      const iframe = parse(html).querySelector(`span.embed-jsfiddle iframe`);

      expect(iframe?.attributes).toEqual(
        expect.objectContaining({ src: validUrl })
      );
    });

    describe('無効なURLの場合', () => {
      test('エラーメッセージを出力する', () => {
        const html = markdownToHtml(`@[jsfiddle](${invalidUrl})`);
        expect(html).toContain('jsfiddleのURLが不正です');
      });
    });
  });

  describe('customEmbed.jsfiddle()を設定している場合', () => {
    test('渡した関数を実行する', () => {
      const customizeText = 'customized text!';
      const mock = jest.fn().mockReturnValue(customizeText);
      const html = markdownToHtml(`@[jsfiddle](${validUrl})`, {
        customEmbed: { jsfiddle: mock },
      });

      expect(mock).toBeCalled();
      expect(html.includes(customizeText)).toBe(true);
    });
  });
});
