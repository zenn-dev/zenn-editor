import { isDocswellUrl } from '../../src/utils/url-matcher';
import { describe, test, expect } from 'vitest';

describe('isDocswellUrlのテスト', () => {
  describe('Docswellの埋め込み用URLの場合', () => {
    test('trueを返すこと', () => {
      const docswellEmbedUrl = 'https://www.docswell.com/slide/LK7J5V/embed';
      expect(isDocswellUrl(docswellEmbedUrl)).toBe(true);
    });
    test('ページ番号(ハッシュ形式)付きの埋め込み用URLでもtrueを返すこと', () => {
      const docswellEmbedUrlWithHashPage =
        'https://www.docswell.com/slide/LK7J5V/embed#p12';
      expect(isDocswellUrl(docswellEmbedUrlWithHashPage)).toBe(true);
    });
    test('ページ番号にXSS文字列が含まれる場合はfalseを返すこと', () => {
      const docswellEmbedUrlWithXssPage =
        'https://www.docswell.com/slide/LK7J5V/embed#p12"><script>alert("XSS")</script>';
      expect(isDocswellUrl(docswellEmbedUrlWithXssPage)).toBe(false);
    });
  });

  describe('DocswellのスライドURLの場合', () => {
    test('trueを返すこと', () => {
      const docswellSlideUrl =
        'https://www.docswell.com/s/ku-suke/LK7J5V-hello-docswell';
      expect(isDocswellUrl(docswellSlideUrl)).toBe(true);
    });
    test('ページ番号(ハッシュ形式)付きのスライドURLでもtrueを返すこと', () => {
      const docswellSlideUrlWithHashPage =
        'https://www.docswell.com/s/ku-suke/LK7J5V-hello-docswell#p13';
      expect(isDocswellUrl(docswellSlideUrlWithHashPage)).toBe(true);
    });
    test('ページ番号(パス形式)付きのスライドURLでもtrueを返すこと', () => {
      const docswellSlideUrlWithPathPage =
        'https://www.docswell.com/s/ku-suke/LK7J5V-hello-docswell/13';
      expect(isDocswellUrl(docswellSlideUrlWithPathPage)).toBe(true);
    });

    test('ページ番号にXSS文字列が含まれる場合はfalseを返すこと', () => {
      const docswellSlideUrlWithXssPage =
        'https://www.docswell.com/s/ku-suke/LK7J5V-hello-docswell/13"><script>alert("XSS")</script>';
      expect(isDocswellUrl(docswellSlideUrlWithXssPage)).toBe(false);
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
