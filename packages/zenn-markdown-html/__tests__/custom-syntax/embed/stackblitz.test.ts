import { vi, describe, test, expect } from 'vitest';
import { parse } from 'node-html-parser';
import { markdownToHtml } from '../../../src/index';

describe('Stackblitz埋め込み要素のテスト', () => {
  const validUrl =
    'https://stackblitz.com/edit/test-examples?embed=1&file=pages/api/[id].ts';
  const invalidUrl = '@https://bad-url.stackblitz.com/edit/test-examples';

  describe('デフォルトの挙動', () => {
    describe('有効なURLの場合', () => {
      test('<iframe />に変換する', () => {
        const html = markdownToHtml(`@[stackblitz](${validUrl})`);
        const iframe = parse(html).querySelector(
          `span.embed-stackblitz iframe`
        );

        expect(iframe?.attributes).toEqual(
          expect.objectContaining({ src: validUrl })
        );
      });
    });

    describe('無効なURLの場合', () => {
      test('エラーメッセージを出力する', () => {
        const html = markdownToHtml(`@[stackblitz](${invalidUrl})`);
        expect(html).toContain('StackBlitzのembed用のURLを指定してください');
      });
    });
  });

  describe('customEmbed.stackblitz()を設定している場合', () => {
    test('渡した関数を実行する', () => {
      const customizeText = 'customized text!';
      const mock = vi.fn().mockReturnValue(customizeText);
      const html = markdownToHtml(`@[stackblitz](${validUrl})`, {
        customEmbed: { stackblitz: mock },
      });

      expect(mock).toBeCalled();
      expect(html).toContain(customizeText);
    });
  });
});
