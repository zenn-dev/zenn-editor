import { vi, describe, test, expect } from 'vitest';
import { parse } from 'node-html-parser';
import markdownToHtml from '../../../src/index';

describe('CodeSandBox埋め込み要素のテスト', () => {
  const validUrl =
    'https://codesandbox.io/embed/test-example?fontsize=14&hidenavigation=1&theme=dark';
  const invalidUrl =
    'https://bad-example.codesandbox.io/embed/test-example?fontsize=14&hidenavigation=1&theme=dark';

  describe('デフォルトの挙動', () => {
    describe('有効なURLの場合', () => {
      test('<iframe />に変換する', () => {
        const html = markdownToHtml(`@[codesandbox](${validUrl})`);
        const iframe = parse(html).querySelector(
          `span.embed-codesandbox iframe`
        );

        expect(iframe?.attributes).toEqual(
          expect.objectContaining({ src: validUrl })
        );
      });
    });

    describe('無効なURLの場合', () => {
      test('エラーメッセージを出力する', () => {
        const html = markdownToHtml(`@[codesandbox](${invalidUrl})`);

        expect(html).toContain(
          '「https://codesandbox.io/embed/」から始まる正しいURLを入力してください'
        );
      });
    });
  });

  describe('customEmbed.codesandbox()を設定している場合', () => {
    test('渡した関数を実行する', () => {
      const customizeText = 'customized text!';
      const mock = vi.fn().mockReturnValue(customizeText);
      const html = markdownToHtml(`@[codesandbox](${validUrl})`, {
        customEmbed: { codesandbox: mock },
      });

      expect(mock).toBeCalled();
      expect(html.includes(customizeText)).toBe(true);
    });
  });
});
