import { describe, test, expect } from 'vitest';
import markdownToHtml from '../../../src/index';

describe('Docswell', () => {
  describe('Docswellの埋め込み用URLの場合', () => {
    test('Docswellのiframeを返すこと', () => {
      const html = markdownToHtml(
        '@[docswell](https://www.docswell.com/slide/LK7J5V/embed)'
      );
      expect(html).toContain(
        '<span class="embed-block embed-docswell"><iframe src="https://www.docswell.com/slide/LK7J5V/embed" allowfullscreen="true" width="100%" style="border:1px solid #ccc;display:block;margin:0px auto;padding:0px;aspect-ratio:16/9"></iframe></span>'
      );
    });
    test('ページ番号(ハッシュ形式)が指定されたDocswellのiframeを返すこと', () => {
      const html = markdownToHtml(
        '@[docswell](https://www.docswell.com/slide/LK7J5V/embed#p12)'
      );
      expect(html).toContain(
        '<span class="embed-block embed-docswell"><iframe src="https://www.docswell.com/slide/LK7J5V/embed#p12" allowfullscreen="true" width="100%" style="border:1px solid #ccc;display:block;margin:0px auto;padding:0px;aspect-ratio:16/9"></iframe></span>'
      );
    });
    test('ページ番号にXSS文字列が含まれる場合はエラーメッセージを返すこと', () => {
      const html = markdownToHtml(
        '@[docswell](https://www.docswell.com/slide/LK7J5V/embed#p12"><script>alert("XSS")</script>)'
      );
      expect(html).toContain('DocswellのスライドURLが不正です');
    });
  });

  describe('DocswellのスライドURLの場合', () => {
    test('Docswellのiframeを返すこと', () => {
      const html = markdownToHtml(
        '@[docswell](https://www.docswell.com/s/ku-suke/LK7J5V-hello-docswell)'
      );
      expect(html).toContain(
        '<span class="embed-block embed-docswell"><iframe src="https://www.docswell.com/slide/LK7J5V/embed" allowfullscreen="true" width="100%" style="border:1px solid #ccc;display:block;margin:0px auto;padding:0px;aspect-ratio:16/9"></iframe></span>'
      );
    });
  });

  describe('DocswellのスライドURL（ページ番号付き）の場合', () => {
    test('ページ番号(パス形式)が指定されたDocswellのiframeを返すこと', () => {
      const html = markdownToHtml(
        '@[docswell](https://www.docswell.com/s/ku-suke/LK7J5V-hello-docswell/12)'
      );
      expect(html).toContain(
        '<span class="embed-block embed-docswell"><iframe src="https://www.docswell.com/slide/LK7J5V/embed#p12" allowfullscreen="true" width="100%" style="border:1px solid #ccc;display:block;margin:0px auto;padding:0px;aspect-ratio:16/9"></iframe></span>'
      );
    });

    test('ページ番号(ハッシュ形式)が指定されたDocswellのiframeを返すこと', () => {
      const html = markdownToHtml(
        '@[docswell](https://www.docswell.com/s/ku-suke/LK7J5V-hello-docswell#p18)'
      );
      expect(html).toContain(
        '<span class="embed-block embed-docswell"><iframe src="https://www.docswell.com/slide/LK7J5V/embed#p18" allowfullscreen="true" width="100%" style="border:1px solid #ccc;display:block;margin:0px auto;padding:0px;aspect-ratio:16/9"></iframe></span>'
      );
    });
    test('ページ番号にXSS文字列が含まれる場合はエラーメッセージを返すこと', () => {
      const html = markdownToHtml(
        '@[docswell](https://www.docswell.com/s/ku-suke/LK7J5V-hello-docswell/12"><script>alert("XSS")</script>)'
      );
      expect(html).toContain('DocswellのスライドURLが不正です');
    });
  });

  describe('DocswellのURLが不正な場合', () => {
    test('エラーメッセージを返すこと', () => {
      const html = markdownToHtml(
        '@[docswell](https://www.docswell.com/invalid)'
      );
      expect(html).toContain('DocswellのスライドURLが不正です');
    });
  });
});
