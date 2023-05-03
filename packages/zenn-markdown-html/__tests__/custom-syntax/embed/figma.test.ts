import { parse } from 'node-html-parser';
import markdownToHtml from '../../../src/index';

describe('Testing of Figma Embedded Elements', () => {
  const validUrl =
    'https://www.figma.com/file/LKQ4FJ4ExAmPLEedbRp931/Sample-File?node-id=0%3A1';
  const invalidUrl =
    'https://www.figma.com/bad-example/file/LKQ4FJ4ExAmPLEedbRp931/Sample-File?node-id=0%3A1';

  describe('Default behavior', () => {
    describe('For valid URLs', () => {
      test('should be converted to <iframe />', () => {
        const html = markdownToHtml(`@[figma](${validUrl})`);
        const iframe = parse(html).querySelector(`span.embed-figma iframe`);

        expect(iframe?.attributes).toEqual(
          expect.objectContaining({ src: expect.stringContaining(validUrl) })
        );
      });
    });

    describe('For invalid URLs', () => {
      test('should output error message', () => {
        const html = markdownToHtml(`@[figma](${invalidUrl})`);

        expect(html).toContain(
          'ファイルまたはプロトタイプのFigma URLを指定してください'
        );
      });
    });
  });

  describe('If customEmbed.figma() is set', () => {
    test('should function be executed', () => {
      const customizeText = 'customized text!';
      const mock = jest.fn().mockReturnValue(customizeText);
      const html = markdownToHtml(`@[figma](${validUrl})`, {
        customEmbed: { figma: mock },
      });

      expect(mock).toBeCalled();
      expect(html.includes(customizeText)).toBe(true);
    });
  });
});
