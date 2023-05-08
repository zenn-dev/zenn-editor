import { parse } from 'node-html-parser';
import markdownToHtml from '../../../src/index';

describe('Testing Codepen Embedded Elements', () => {
  const validUrl = 'https://codepen.io/examples/pen/test?default-tab=hoge';
  const invalidUrl =
    'https://bad-example.codepen.io/examples/pen/test?default-tab=hoge';

  describe('Default behavior', () => {
    describe('For valid URLs', () => {
      test('should be converted to <iframe />', () => {
        const html = markdownToHtml(`@[codepen](${validUrl})`);
        const iframe = parse(html).querySelector(`span.embed-codepen iframe`);
        const passedUrl = validUrl.replace('/pen/', '/embed/');

        expect(iframe?.attributes).toEqual(
          expect.objectContaining({ src: expect.stringContaining(passedUrl) })
        );
      });
    });

    describe('For invalid URLs', () => {
      test('should output error message', () => {
        const html = markdownToHtml(`@[codepen](${invalidUrl})`);
        expect(html).toContain('CodePenのURLが不正です');
      });
    });
  });

  describe('If customEmbed.codepen() is set', () => {
    test('should function be executed', () => {
      const customizeText = 'customized text';
      const mock = jest.fn().mockReturnValue(customizeText);
      const html = markdownToHtml(`@[codepen](${invalidUrl})`, {
        customEmbed: { codepen: mock },
      });

      expect(mock).toBeCalled();
      expect(html.includes(customizeText)).toBe(true);
    });
  });
});
