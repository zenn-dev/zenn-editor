import { parse } from 'node-html-parser';
import markdownToHtml from '../../../src/index';

describe('Testing of GitHub Gist Embedded Elements', () => {
  const validUrl = 'https://gist.github.com/examples/9164408';
  const invalidUrl = 'https://bad-example.gist.github.com/examples/9164408';

  describe('Default behavior', () => {
    describe('For valid URLs', () => {
      test('should be converted to link', () => {
        const html = markdownToHtml(`@[gist](${validUrl})`);
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
        const html = markdownToHtml(`@[gist](${invalidUrl})`);
        expect(html).toContain('GitHub GistのページURLを指定してください');
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
  });

  describe('If customEmbed.gist() is set', () => {
    test('should function be executed', () => {
      const url = 'https://example.com';
      const customizeText = 'customized text';
      const mock = jest.fn().mockReturnValue(customizeText);
      const html = markdownToHtml(`@[gist](${url})`, {
        customEmbed: { gist: mock },
      });

      expect(mock).toBeCalled();
      expect(html.includes(customizeText)).toBe(true);
    });
  });
});
