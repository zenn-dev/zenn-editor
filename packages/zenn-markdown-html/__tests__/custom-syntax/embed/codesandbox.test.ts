import { vi, describe, test, expect } from 'vitest';
import { parse } from 'node-html-parser';
import markdownToHtml from '../../../src/index';

describe('CodeSandBox埋め込み要素のテスト', () => {
  const validUrl =
    'https://codesandbox.io/embed/test-example?fontsize=14&hidenavigation=1&theme=dark';
  const invalidUrl =
    'https://bad-example.codesandbox.io/embed/test-example?fontsize=14&hidenavigation=1&theme=dark';

  const srcOf = (html: string) =>
    parse(html).querySelector(`span.embed-codesandbox iframe`)?.attributes?.src;

  describe('デフォルトの挙動', () => {
    describe('有効なURLの場合', () => {
      test('<iframe />に変換する', async () => {
        const html = await markdownToHtml(`@[codesandbox](${validUrl})`);
        const iframe = parse(html).querySelector(
          `span.embed-codesandbox iframe`
        );

        expect(iframe).not.toBeNull();
        expect(iframe?.attributes?.src).toContain(
          'https://codesandbox.io/embed/test-example'
        );
      });
    });

    describe('無効なURLの場合', () => {
      test('エラーメッセージを出力する', async () => {
        const html = await markdownToHtml(`@[codesandbox](${invalidUrl})`);

        expect(html).toContain(
          '「https://codesandbox.io/embed/」から始まる正しいURLを入力してください'
        );
      });
    });
  });

  describe('runonclick=1（click-to-load）の強制付与', () => {
    test('runonclickが無いURLにはrunonclick=1を付与する', async () => {
      const html = await markdownToHtml(`@[codesandbox](${validUrl})`);
      expect(srcOf(html)).toBe(`${validUrl}&runonclick=1`);
    });

    test('クエリが無いURLには?runonclick=1を付与する', async () => {
      const url = 'https://codesandbox.io/embed/test-example';
      const html = await markdownToHtml(`@[codesandbox](${url})`);
      expect(srcOf(html)).toBe(`${url}?runonclick=1`);
    });

    test('runonclick=0が指定されていてもrunonclick=1に上書きする', async () => {
      const url =
        'https://codesandbox.io/embed/test-example?runonclick=0&theme=dark';
      const html = await markdownToHtml(`@[codesandbox](${url})`);
      expect(srcOf(html)).toBe(
        'https://codesandbox.io/embed/test-example?runonclick=1&theme=dark'
      );
    });

    test('既にrunonclick=1があれば二重付与しない（冪等）', async () => {
      const url =
        'https://codesandbox.io/embed/test-example?theme=dark&runonclick=1';
      const html = await markdownToHtml(`@[codesandbox](${url})`);
      expect(srcOf(html)).toBe(url);
    });
  });

  describe('customEmbed.codesandbox()を設定している場合', () => {
    test('渡した関数を実行する', async () => {
      const customizeText = 'customized text!';
      const mock = vi.fn().mockReturnValue(customizeText);
      const html = await markdownToHtml(`@[codesandbox](${validUrl})`, {
        customEmbed: { codesandbox: mock },
      });

      expect(mock).toBeCalled();
      expect(html.includes(customizeText)).toBe(true);
    });
  });
});
