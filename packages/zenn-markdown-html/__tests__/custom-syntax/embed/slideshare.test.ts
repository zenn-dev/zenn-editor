import { parse } from 'node-html-parser';
import markdownToHtml from '../../../src/index';

describe('Testing SlideShare Embedded Elements', () => {
  const validToken = 'example-token';
  const invalidToken = '@invalid-token';

  describe('Default behavior', () => {
    describe('For valid URLs', () => {
      test('should be converted to <iframe />', () => {
        const html = markdownToHtml(`@[slideshare](${validToken})`);
        const iframe = parse(html).querySelector(
          `span.embed-slideshare iframe`
        );

        expect(iframe?.attributes).toEqual(
          expect.objectContaining({
            src: `https://www.slideshare.net/slideshow/embed_code/key/${validToken}`,
          })
        );
      });
    });

    describe('For invalid URLs', () => {
      test('should output error message', () => {
        const html = markdownToHtml(`@[slideshare](${invalidToken})`);
        expect(html).toContain('Slide Shareのkeyが不正です');
      });
    });
  });

  describe('If customEmbed.slideshare() is set', () => {
    test('should function be executed', () => {
      const customizeText = 'customized text!';
      const mock = jest.fn().mockReturnValue(customizeText);
      const html = markdownToHtml(`@[slideshare](${validToken})`, {
        customEmbed: { slideshare: mock },
      });

      expect(mock).toBeCalled();
      expect(html).toContain(customizeText);
    });
  });
});
