import { isDocswellUrl } from '../../src/utils/url-matcher';
import { describe, test, expect } from 'vitest';

describe('isDocswellUrlのテスト', () => {
  describe('Docswellの埋め込み用URLの場合', () => {
    test('trueを返すこと', () => {
      const docswellEmbedUrl = 'https://www.docswell.com/slide/LK7J5V/embed';
      expect(isDocswellUrl(docswellEmbedUrl)).toBe(true);
    });
  });

  describe('DocswellのスライドURLの場合', () => {
    test('trueを返すこと', () => {
      const docswellSlideUrl =
        'https://www.docswell.com/s/ku-suke/LK7J5V-hello-docswell';
      expect(isDocswellUrl(docswellSlideUrl)).toBe(true);
    });
  });

  describe('Docswellの他の画面のURLの場合', () => {
    test('falseを返すこと', () => {
      const docswellUrls = ['https://www.docswell.com/'];

      docswellUrls.forEach((url) => {
        expect(isDocswellUrl(url)).toBe(false);
      });
    });
  });

  describe('他のサイトのURLの場合', () => {
    test('falseを返すこと', () => {
      const otherSiteUrls = ['https://zenn.dev/', 'https://github.com/'];

      otherSiteUrls.forEach((url) => {
        expect(isDocswellUrl(url)).toBe(false);
      });
    });
  });
});
