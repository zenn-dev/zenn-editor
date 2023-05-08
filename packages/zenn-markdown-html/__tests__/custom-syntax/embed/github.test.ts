import { parse } from 'node-html-parser';
import markdownToHtml from '../../../src/index';

describe('Testing of GitHub Embedded Elements', () => {
  const validUrl =
    'https://github.com/zenn-dev/example-repo/blob/main/example.json';
  const invalidUrl =
    'https://bad-example.github.com/zenn-dev/example-repo/blob/main/example.json';

  describe('Default behavior', () => {
    describe('For valid URLs', () => {
      test('should be converted to link', () => {
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

    describe('For invalid URLs', () => {
      test('should output error message', () => {
        const html = markdownToHtml(`@[github](${invalidUrl})`);
        expect(html).toContain(
          'GitHub のファイルURLまたはパーマリンクを指定してください'
        );
      });
    });
  });

  describe('If you have set up an embedOrigin', () => {
    test('shoud be displayed <iframe /> with the passed embeddedOrigin as `src`', () => {
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

  describe('If you have set up customEmbed.github()', () => {
    test('should function be executed', () => {
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
