import { parse } from 'node-html-parser';
import markdownToHtml from '../../../src/index';

describe('GitHub埋め込み要素のテスト', () => {
  const validUrl =
    'https://github.com/zenn-dev/example-repo/blob/main/example.json';
  const invalidUrl =
    'https://bad-example.github.com/zenn-dev/example-repo/blob/main/example.json';

  describe('デフォルトの挙動', () => {
    describe('有効なURLの場合', () => {
      test('リンクに変換する', () => {
        const html = markdownToHtml(`@[github](${validUrl})`);
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
        const html = markdownToHtml(`@[github](${invalidUrl})`);
        expect(html).toContain(
          'GitHub のファイルURLまたはパーマリンクを指定してください'
        );
      });
    });
  });

  describe('embedOriginを設定している場合', () => {
    test('渡したembedOriginを`src`として<iframe />を表示する', () => {
      const embedOrigin = 'https://embed.example.com';
      const html = markdownToHtml(`@[github](${validUrl})`, { embedOrigin });
      const iframe = parse(html).querySelector('span.zenn-embedded iframe');

      expect(iframe?.attributes).toEqual(
        expect.objectContaining({
          src: expect.stringMatching(embedOrigin),
          'data-content': encodeURIComponent(validUrl),
        })
      );
    });
  });

  describe('customEmbed.github()を設定している場合', () => {
    test('渡した関数を実行する', () => {
      const url = 'https://example.com';
      const customizeText = 'customized text';
      const mock = jest.fn().mockReturnValue(customizeText);
      const html = markdownToHtml(`@[github](${url})`, {
        customEmbed: { github: mock },
      });

      expect(mock).toBeCalled();
      expect(html).toContain(customizeText);
    });
  });
});
