import { parse } from 'node-html-parser';
import markdownToHtml from '../../../src/index';

describe('Testing Tweet Embedded Elements', () => {
  const validUrl = 'https://twitter.com/zenn-dev/status/example';
  const invalidUrl = 'https://bad-url.twitter.com/zenn-dev/status/example';

  describe('Default behavior', () => {
    describe('For valid URLs', () => {
      test('should be converted to link', () => {
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
    });

    describe('For invalid URLs', () => {
      test('should output error message', () => {
        const html = markdownToHtml(`@[tweet](${invalidUrl})`);
        expect(html).toContain('ツイートページのURLを指定してください');
      });
    });
  });

  describe('If you have set up an embedOrigin', () => {
    test('shoud be displayed <iframe /> with the passed embeddedOrigin as `src`', () => {
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

  describe('If you have set customEmbed.tweet()', () => {
    test('should function be executed', () => {
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
