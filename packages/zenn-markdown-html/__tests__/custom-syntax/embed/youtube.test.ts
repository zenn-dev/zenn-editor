import { parse } from 'node-html-parser';
import markdownToHtml from '../../../src/index';

describe('Testing Youtube Embedded Elements', () => {
  const validVideoId = 'exampletest'; // 11文字する
  const invalidVideoId = '@bad-video-id';

  describe('Default behavior', () => {
    describe('For a valid videoId', () => {
      test('should be converted to <iframe />', () => {
        const html = markdownToHtml(`@[youtube](${validVideoId})`);
        const iframe = parse(html).querySelector(`span.embed-youtube iframe`);

        expect(iframe?.attributes).toEqual(
          expect.objectContaining({
            src: `https://www.youtube-nocookie.com/embed/${validVideoId}`,
          })
        );
      });
    });

    describe('For a invalid videoId', () => {
      test('should output error message', () => {
        const html = markdownToHtml(`@[youtube](${invalidVideoId})`);
        expect(html).toContain('YouTubeのvideoIDが不正です');
      });
    });
  });

  describe('If you have set customEmbed.youtube()', () => {
    test('should function be executed', () => {
      const customizeText = 'customized text';
      const mock = jest.fn().mockReturnValue(customizeText);
      const html = markdownToHtml(`@[youtube](${validVideoId})`, {
        customEmbed: { youtube: mock },
      });

      expect(mock).toBeCalled();
      expect(html.includes(customizeText)).toBe(true);
    });
  });
});
