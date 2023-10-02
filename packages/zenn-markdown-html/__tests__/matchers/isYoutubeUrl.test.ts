import { describe, test, expect } from 'vitest';
import { isYoutubeUrl } from '../../src/utils/url-matcher';

describe('isYoutubeUrlのテスト', () => {
  describe('Trueを返す場合', () => {
    test('動画URLの時', () => {
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

    test('共有リンクのURLの時', () => {
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

    describe('Falseを返す場合', () => {
      test('URLが正しくない時', () => {
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

      test('XSSを含んでいる時', () => {
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
