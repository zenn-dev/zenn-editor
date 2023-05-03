import { parse } from 'node-html-parser';
import markdownToHtml from '../../../src/index';

describe('Testing CodeSandBox Embedded Elements', () => {
  const validUrl =
    'https://codesandbox.io/embed/test-example?fontsize=14&hidenavigation=1&theme=dark';
  const invalidUrl =
    'https://bad-example.codesandbox.io/embed/test-example?fontsize=14&hidenavigation=1&theme=dark';

  describe('Default behavior', () => {
    describe('For valid URLs', () => {
      test('should be converted to <iframe />', () => {
        const html = markdownToHtml(`@[codesandbox](${validUrl})`);
        const iframe = parse(html).querySelector(
          `span.embed-codesandbox iframe`
        );

        expect(iframe?.attributes).toEqual(
          expect.objectContaining({ src: validUrl })
        );
      });
    });

    describe('For invalid URLs', () => {
      test('should output error message', () => {
        const html = markdownToHtml(`@[codesandbox](${invalidUrl})`);

        expect(html).toContain(
          '「https://codesandbox.io/embed/」から始まる正しいURLを入力してください'
        );
      });
    });
  });

  describe('If customEmbed.codesandbox() is set', () => {
    test('should function be executed', () => {
      const customizeText = 'customized text!';
      const mock = jest.fn().mockReturnValue(customizeText);
      const html = markdownToHtml(`@[codesandbox](${validUrl})`, {
        customEmbed: { codesandbox: mock },
      });

      expect(mock).toBeCalled();
      expect(html.includes(customizeText)).toBe(true);
    });
  });
});
