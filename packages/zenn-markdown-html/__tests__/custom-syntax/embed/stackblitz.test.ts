import { vi, describe, test, expect } from 'vitest';
import { parse } from 'node-html-parser';
import markdownToHtml from '../../../src/index';

describe('Stackblitz埋め込み要素のテスト', () => {
  const validUrl =
    'https://stackblitz.com/edit/test-examples?embed=1&file=pages/api/[id].ts';
  const invalidUrl = '@https://bad-url.stackblitz.com/edit/test-examples';

  const srcOf = (html: string) =>
    parse(html).querySelector(`span.embed-stackblitz iframe`)?.attributes?.src;

  describe('デフォルトの挙動', () => {
    describe('有効なURLの場合', () => {
      test('<iframe />に変換する', async () => {
        const html = await markdownToHtml(`@[stackblitz](${validUrl})`);
        const iframe = parse(html).querySelector(
          `span.embed-stackblitz iframe`
        );

        expect(iframe).not.toBeNull();
        expect(iframe?.attributes?.src).toContain(
          'https://stackblitz.com/edit/test-examples'
        );
      });
    });

    describe('無効なURLの場合', () => {
      test('エラーメッセージを出力する', async () => {
        const html = await markdownToHtml(`@[stackblitz](${invalidUrl})`);
        expect(html).toContain('StackBlitzのembed用のURLを指定してください');
      });
    });
  });

  describe('ctl=1（click-to-load）の強制付与', () => {
    test('ctlが無いURLにはctl=1を付与する', async () => {
      const html = await markdownToHtml(`@[stackblitz](${validUrl})`);
      expect(srcOf(html)).toBe(`${validUrl}&ctl=1`);
    });

    test('クエリが無いURLには?ctl=1を付与する', async () => {
      const url = 'https://stackblitz.com/edit/test-examples';
      const html = await markdownToHtml(`@[stackblitz](${url})`);
      expect(srcOf(html)).toBe(`${url}?ctl=1`);
    });

    test('ctl=0が指定されていてもctl=1に上書きする', async () => {
      const url =
        'https://stackblitz.com/edit/test-examples?embed=1&ctl=0&file=index.ts';
      const html = await markdownToHtml(`@[stackblitz](${url})`);
      expect(srcOf(html)).toBe(
        'https://stackblitz.com/edit/test-examples?embed=1&ctl=1&file=index.ts'
      );
    });

    test('既にctl=1があれば二重付与しない（冪等）', async () => {
      const url = 'https://stackblitz.com/edit/test-examples?embed=1&ctl=1';
      const html = await markdownToHtml(`@[stackblitz](${url})`);
      expect(srcOf(html)).toBe(url);
    });
  });

  describe('customEmbed.stackblitz()を設定している場合', () => {
    test('渡した関数を実行する', async () => {
      const customizeText = 'customized text!';
      const mock = vi.fn().mockReturnValue(customizeText);
      const html = await markdownToHtml(`@[stackblitz](${validUrl})`, {
        customEmbed: { stackblitz: mock },
      });

      expect(mock).toBeCalled();
      expect(html).toContain(customizeText);
    });
  });
});
