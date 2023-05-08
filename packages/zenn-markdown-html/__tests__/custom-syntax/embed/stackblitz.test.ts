import { parse } from 'node-html-parser';
import markdownToHtml from '../../../src/index';

describe('Testing Stackblitz Embedded Elements', () => {
  const validUrl = 'https://stackblitz.com/edit/test-examples?embed=1&file=pages/api/[id].ts';
  const invalidUrl = '@https://bad-url.stackblitz.com/edit/test-examples';

  describe('Default behavior', () => {
    describe('For valid URLs', () => {
      test('should be converted to <iframe />', () => {
        const html = markdownToHtml(`@[stackblitz](${validUrl})`);
        const iframe = parse(html).querySelector(
          `span.embed-stackblitz iframe`
        );

        expect(iframe?.attributes).toEqual(
          expect.objectContaining({ src: validUrl })
        );
      });
    });

    describe('For invalid URLs', () => {
      test('should output error message', () => {
        const html = markdownToHtml(`@[stackblitz](${invalidUrl})`);
        expect(html).toContain('StackBlitzのembed用のURLを指定してください');
      });
    });
  });

  describe('If customEmbed.stackblitz() is set', () => {
    test('should function be executed', () => {
      const customizeText = 'customized text!';
      const mock = jest.fn().mockReturnValue(customizeText);
      const html = markdownToHtml(`@[stackblitz](${validUrl})`, {
        customEmbed: { stackblitz: mock },
      });

      expect(mock).toBeCalled();
      expect(html).toContain(customizeText);
    });
  });
});
