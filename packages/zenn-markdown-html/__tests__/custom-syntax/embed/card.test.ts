import { vi, describe, test, expect } from 'vitest';
import { parse } from 'node-html-parser';
import markdownToHtml from '../../../src/index';

describe('LinkCard埋め込み要素のテスト', () => {
  const validUrl = 'https://example.com';
  const invalidUrl = 'bad-example.com';

  describe('デフォルトの挙動', () => {
    describe('有効なURL', () => {
      test('リンクに変換する', () => {
        const html = markdownToHtml(`@[card](${validUrl})`);
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
      test('エラーメッセージを出力する', () => {
        const html = markdownToHtml(`@[card](${invalidUrl})`);
        expect(html).toContain('URLが不正です');
      });
    });

    describe('メールアドレス', () => {
      test('メールアドレスのまま出力する', () => {
        const html = markdownToHtml(`ec2-user@33.80.180.159`);
        expect(html).toContain('ec2-user@33.80.180.159');
        expect(html).not.toContain('URLが不正です');
      });
    });
  });

  describe('embedOriginを設定している場合', () => {
    test('渡したembedOriginを`src`として<iframe />を表示する', () => {
      const embedOrigin = 'https://embed.example.com';
      const html = markdownToHtml(validUrl, { embedOrigin });
      const iframe = parse(html).querySelector('span.zenn-embedded iframe');

      expect(iframe?.attributes).toEqual(
        expect.objectContaining({
          src: expect.stringMatching(embedOrigin),
          'data-content': encodeURIComponent(validUrl),
        })
      );
    });
  });

  describe('customEmbed.card()を設定している場合', () => {
    test('渡した関数を実行する', () => {
      const url = 'https://example.com';
      const customizeText = 'customized text';
      const mock = vi.fn().mockReturnValue(customizeText);
      const html = markdownToHtml(`@[card](${url})`, {
        customEmbed: { card: mock },
      });

      expect(mock).toBeCalled();
      expect(html.includes(customizeText)).toBe(true);
    });
  });
});
