import { isYoutubeUrl } from '../../src/utils/url-matcher';

describe('Testing isYoutubeUrl', () => {
  describe('If True is returned', () => {
    test('When the video URL', () => {
      const goodUrlList = [
        'http://www.youtube.com/watch?v=Xx0XXxXXXx0',
        'https://www.youtube.com/watch?v=Xx0XXxXXXx0',
        'http://www.youtube.com/watch?v=Xx0XXxXXXx0&t=1000s',
        'https://www.youtube.com/watch?v=Xx0XXxXXXx0&t=1000s',
      ];

      goodUrlList.forEach((url) => {
        expect(isYoutubeUrl(url)).toBe(true);
      });
    });

    test('When the URL of the shared link', () => {
      const goodUrlList = [
        'https://youtu.be/Xx0XXxXXXx0',
        'http://youtu.be/Xx0XXxXXXx0',
        'https://youtu.be/Xx0XXxXXXx0?t=1000',
        'http://youtu.be/Xx0XXxXXXx0?t=1000',
      ];

      goodUrlList.forEach((url) => {
        expect(isYoutubeUrl(url)).toBe(true);
      });
    });

    describe('If False is returned', () => {
      test('When the URL is incorrect', () => {
        const badUrlList = [
          'bad-string',
          'https://example.com',
          'http://youtube.com/',
          'http://www.youtube.com/',
          'https://youtu.be/hoge/hoge',
          'https://youtube.com:3000/watch?v=Xx0XXxXXXx0',
          'https://www.youtube.com/playlist?list=XXXXXXXXXXXXXXXXXX-xxxxxxxxxxxxxxx',
        ];

        badUrlList.forEach((url) => {
          expect(isYoutubeUrl(url)).toBe(false);
        });
      });

      test('should be contained XSS', () => {
        const badUrlList = [
          'https://youtu.be/Xx0XXxXXXx0?onload=alert(1)',
          'https://www.youtube.com/watch?v=Xx0XXxXXXx0&onload=alert(1)',
        ];

        badUrlList.forEach((url) => {
          expect(isYoutubeUrl(url)).toBe(false);
        });
      });
    });
  });
});
