import { parse } from 'node-html-parser';
import markdownToHtml from '../../../src/index';

describe('Testing SpeakerDeck Embedded Elements', () => {
  const validToken = 'example-token';
  const invalidToken = '@invalid-token';

  describe('Default behavior', () => {
    describe('For valid URLs', () => {
      test('should be converted to <iframe />', () => {
        const html = markdownToHtml(`@[speakerdeck](${validToken})`);
        const iframe = parse(html).querySelector(
          `span.embed-speakerdeck iframe`
        );

        expect(iframe?.attributes).toEqual(
          expect.objectContaining({
            src: `https://speakerdeck.com/player/${validToken}`,
          })
        );
      });
    });

    describe('For invalid URLs', () => {
      test('should output error message', () => {
        const html = markdownToHtml(`@[speakerdeck](${invalidToken})`);
        expect(html).toContain('Speaker Deckのkeyが不正です');
      });
    });
  });

  describe('If you have set customEmbed.speakerdeck()', () => {
    test('should function be executed', () => {
      const customizeText = 'customized text!';
      const mock = jest.fn().mockReturnValue(customizeText);
      const html = markdownToHtml(`@[speakerdeck](${validToken})`, {
        customEmbed: { speakerdeck: mock },
      });

      expect(mock).toBeCalled();
      expect(html).toContain(customizeText);
    });
  });
});
