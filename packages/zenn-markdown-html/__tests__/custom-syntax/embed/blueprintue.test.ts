import { vi, describe, test, expect } from 'vitest';
import { parse } from 'node-html-parser';
import { markdownToHtml } from '../../../src/index';

describe('Blueprintue埋め込み要素のテスト', () => {
  const validUrl = 'https://blueprintue.com/render/examples';
  const invalidUrl = 'https://bad-example.blueprintue.com/render/examples';

  describe('デフォルトの挙動', () => {
    describe('有効なURLの場合', () => {
      test('<iframe />に変換する', () => {
        const html = markdownToHtml(`@[blueprintue](${validUrl})`);
        const iframe = parse(html).querySelector(
          `span.embed-blueprintue iframe`
        );

        expect(iframe?.attributes).toEqual(
          expect.objectContaining({ src: validUrl })
        );
      });
    });

    describe('無効なURLの場合', () => {
      test('エラーメッセージを出力する', () => {
        const html = markdownToHtml(`@[blueprintue](${invalidUrl})`);

        expect(html).toContain(
          '「https://blueprintue.com/render/」から始まる正しいURLを指定してください'
        );
      });
    });
  });

  describe('customEmbed.blueprintue()を設定している場合', () => {
    test('渡した関数を実行する', () => {
      const customizeText = 'customized text!';
      const mock = vi.fn().mockReturnValue(customizeText);
      const html = markdownToHtml(`@[blueprintue](${validUrl})`, {
        customEmbed: { blueprintue: mock },
      });

      expect(mock).toBeCalled();
      expect(html.includes(customizeText)).toBe(true);
    });
  });
});
