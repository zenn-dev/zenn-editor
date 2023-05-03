import { parse } from 'node-html-parser';
import markdownToHtml from '../../../src/index';

describe('Testing jsfiddle embedded elements', () => {
  const validUrl = 'https://jsfiddle.net/examples/embedded';
  const invalidUrl = 'https://bad-example.jsfiddle.net/examples/embedded';

  describe('Default behavior', () => {
    describe('For valid URLs', () => {
      test('should be converted to <iframe />', () => {
        const html = markdownToHtml(`@[jsfiddle](${validUrl})`);
        const iframe = parse(html).querySelector(`span.embed-jsfiddle iframe`);

        expect(iframe?.attributes).toEqual(
          expect.objectContaining({ src: validUrl })
        );
      });
    });

    describe('For invalid URLs', () => {
      test('should output error message', () => {
        const html = markdownToHtml(`@[jsfiddle](${invalidUrl})`);
        expect(html).toContain('jsfiddleのURLが不正です');
      });
    });
  });

  describe('If customEmbed.jsfiddle() is set', () => {
    test('should function be executed', () => {
      const customizeText = 'customized text!';
      const mock = jest.fn().mockReturnValue(customizeText);
      const html = markdownToHtml(`@[jsfiddle](${validUrl})`, {
        customEmbed: { jsfiddle: mock },
      });

      expect(mock).toBeCalled();
      expect(html.includes(customizeText)).toBe(true);
    });
  });
});
