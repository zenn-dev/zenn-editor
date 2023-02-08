import { parse } from 'node-html-parser';
import markdownToHtml from '../../src/index';

describe('Tweet埋め込み要素のテスト', () => {
  const validUrl = 'https://twitter.com/zenn-dev/status/example';
  const invalidUrl = 'https://bad-url.twitter.com/zenn-dev/status/example';

  describe('デフォルトの挙動の場合', () => {
    test('@[tweet](...)をリンクに変換する', () => {
      const html = markdownToHtml(`@[tweet](${validUrl})`);
      const link = parse(html).querySelector(`a`);

      expect(link?.attributes).toEqual(
        expect.objectContaining({
          href: validUrl,
          rel: 'noreferrer noopener nofollow',
          target: '_blank',
        })
      );
    });

    test('TwitterのツイートURLをリンクに変換する', () => {
      const html = markdownToHtml(validUrl);
      const link = parse(html).querySelector(`a`);

      expect(link?.attributes).toEqual(
        expect.objectContaining({
          href: validUrl,
          rel: 'noreferrer noopener nofollow',
          target: '_blank',
        })
      );
    });

    describe('無効なURLの場合', () => {
      test('エラーメッセージを出力する', () => {
        const html = markdownToHtml(`@[tweet](${invalidUrl})`);
        expect(html).toContain('ツイートページのURLを指定してください');
      });
    });
  });

  describe('embedOriginを設定している場合', () => {
    test('渡した embedOrigin を src として<iframe />を表示する', () => {
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

  describe('customEmbed.tweet()を設定している場合', () => {
    test('渡した関数を実行する', () => {
      const customizeText = 'customized text';
      const mock = jest.fn().mockReturnValue(customizeText);
      const html = markdownToHtml('https://twitter.com/jack/status/20', {
        customEmbed: { tweet: mock },
      });

      expect(mock).toBeCalled();
      expect(html.includes(customizeText)).toBe(true);
    });
  });
});
