import { vi, describe, test, expect } from 'vitest';
import { parse } from 'node-html-parser';
import markdownToHtml from '../../../src/index';

describe('GitHub Gist埋め込み要素のテスト', () => {
  const validUrl = 'https://gist.github.com/examples/9164408';
  const invalidUrl = 'https://bad-example.gist.github.com/examples/9164408';

  describe('デフォルトの挙動', () => {
    describe('有効なURLの場合', () => {
      test('リンクに変換する', async () => {
        const html = await markdownToHtml(`@[gist](${validUrl})`);
        const link = parse(html).querySelector(`a`);

        expect(link?.attributes).toEqual(
          expect.objectContaining({
            href: validUrl,
            rel: 'noreferrer noopener nofollow',
            target: '_blank',
          })
        );
      });
    });

    describe('無効なURLの場合', () => {
      test('エラーメッセージを出力する', async () => {
        const html = await markdownToHtml(`@[gist](${invalidUrl})`);
        expect(html).toContain('GitHub GistのページURLを指定してください');
      });
    });

    describe('embedOriginを設定している場合', () => {
      test('渡したembedOriginを`src`として<iframe />を表示する', async () => {
        const embedOrigin = 'https://embed.example.com';
        const html = await markdownToHtml(validUrl, { embedOrigin });
        const iframe = parse(html).querySelector('span.zenn-embedded iframe');

        expect(iframe?.attributes).toEqual(
          expect.objectContaining({
            src: expect.stringMatching(embedOrigin),
            'data-content': encodeURIComponent(validUrl),
          })
        );
      });
    });
  });

  describe('customEmbed.gist()を設定している場合', () => {
    test('渡した関数を実行する', async () => {
      const url = 'https://example.com';
      const customizeText = 'customized text';
      const mock = vi.fn().mockReturnValue(customizeText);
      const html = await markdownToHtml(`@[gist](${url})`, {
        customEmbed: { gist: mock },
      });

      expect(mock).toBeCalled();
      expect(html.includes(customizeText)).toBe(true);
    });
  });
});
