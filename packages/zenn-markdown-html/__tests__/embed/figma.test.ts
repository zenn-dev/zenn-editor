import { parse } from 'node-html-parser';
import markdownToHtml from '../../src/index';

describe('Figma埋め込み要素のテスト', () => {
  const validUrl =
    'https://www.figma.com/file/LKQ4FJ4ExAmPLEedbRp931/Sample-File?node-id=0%3A1';
  const invalidUrl =
    'https://www.figma.com/bad-example/file/LKQ4FJ4ExAmPLEedbRp931/Sample-File?node-id=0%3A1';

  describe('デフォルトの挙動', () => {
    describe('有効なURLの場合', () => {
      test('<iframe />に変換する', () => {
        const html = markdownToHtml(`@[figma](${validUrl})`);
        const iframe = parse(html).querySelector(`span.embed-figma iframe`);

        expect(iframe?.attributes).toEqual(
          expect.objectContaining({ src: expect.stringContaining(validUrl) })
        );
      });
    });

    describe('無効なURLの場合', () => {
      test('エラーメッセージを出力する', () => {
        const html = markdownToHtml(`@[figma](${invalidUrl})`);

        expect(html).toContain(
          'ファイルまたはプロトタイプのFigma URLを指定してください'
        );
      });
    });
  });

  describe('customEmbed.figma()を設定している場合', () => {
    test('渡した関数を実行する', () => {
      const customizeText = 'customized text!';
      const mock = jest.fn().mockReturnValue(customizeText);
      const html = markdownToHtml(`@[figma](${validUrl})`, {
        customEmbed: { figma: mock },
      });

      expect(mock).toBeCalled();
      expect(html.includes(customizeText)).toBe(true);
    });
  });
});
