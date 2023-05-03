import { parse } from 'node-html-parser';
import markdownToHtml from '../../../src/index';

describe('Testing Blueprintue Embedded Elements', () => {
  const validUrl = 'https://blueprintue.com/render/examples';
  const invalidUrl = 'https://bad-example.blueprintue.com/render/examples';

  describe('Default behavior', () => {
    describe('For valid URLs', () => {
      test('should be converted to <iframe />', () => {
        const html = markdownToHtml(`@[blueprintue](${validUrl})`);
        const iframe = parse(html).querySelector(
          `span.embed-blueprintue iframe`
        );

        expect(iframe?.attributes).toEqual(
          expect.objectContaining({ src: validUrl })
        );
      });
    });

    describe('For invalid URLs', () => {
      test('should output error message', () => {
        const html = markdownToHtml(`@[blueprintue](${invalidUrl})`);

        expect(html).toContain(
          '「https://blueprintue.com/render/」から始まる正しいURLを指定してください'
        );
      });
    });
  });

  describe('If customEmbed.blueprintue() is set', () => {
    test('should function be executed', () => {
      const customizeText = 'customized text!';
      const mock = jest.fn().mockReturnValue(customizeText);
      const html = markdownToHtml(`@[blueprintue](${validUrl})`, {
        customEmbed: { blueprintue: mock },
      });

      expect(mock).toBeCalled();
      expect(html.includes(customizeText)).toBe(true);
    });
  });
});
