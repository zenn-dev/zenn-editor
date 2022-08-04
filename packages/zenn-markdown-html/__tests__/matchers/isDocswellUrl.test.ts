import { isDocswellUrl } from '../../src/utils/url-matcher';

describe('isDocswellUrlのテスト', () => {
  describe('Docswellの埋め込み用URLのとき', () => {
    test('trueを返すこと', () => {
      const docswellEmbedUrl = 'https://www.docswell.com/slide/LK7J5V/embed';
      expect(isDocswellUrl(docswellEmbedUrl)).toBe(true);
    })
  });

  describe('Docswellの他の画面のURLのとき', () => {
    test('falseを返すこと', () => {
      const docswellUrls = [
        'https://www.docswell.com/',
        'https://www.docswell.com/s/ku-suke/LK7J5V-hello-docswell',
      ]

      docswellUrls.forEach((url) => {
        expect(isDocswellUrl(url)).toBe(false);
      })
    })
  });

  describe('他のサイトのURLのとき', () => {
    test('falseを返すこと', () => {
      const otherSiteUrls = [
        'https://zenn.dev/',
        'https://github.com/',
      ]

      otherSiteUrls.forEach((url) => {
        expect(isDocswellUrl(url)).toBe(false);
      })
    })
  });
});
