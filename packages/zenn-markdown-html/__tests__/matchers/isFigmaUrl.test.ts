import { describe, test, expect } from 'vitest';
import { isFigmaUrl } from '../../src/utils/url-matcher';

describe('isFigmaUrlのテスト', () => {
  describe('Trueを返す場合', () => {
    test('v1 file URL', () => {
      expect(
        isFigmaUrl(
          'https://www.figma.com/file/LKQ4FJ4bTnCSjedbRpk931/Sample-File'
        )
      ).toBe(true);
    });

    test('v1 file URL with node-id', () => {
      expect(
        isFigmaUrl(
          'https://www.figma.com/file/LKQ4FJ4bTnCSjedbRpk931/Sample-File?node-id=0-1'
        )
      ).toBe(true);
    });

    test('v1 proto URL', () => {
      expect(
        isFigmaUrl(
          'https://www.figma.com/proto/LKQ4FJ4bTnCSjedbRpk931/Sample-Proto'
        )
      ).toBe(true);
    });

    test('v1 file URL without slug', () => {
      expect(
        isFigmaUrl('https://www.figma.com/file/LKQ4FJ4bTnCSjedbRpk931')
      ).toBe(true);
    });

    test('v1 proto URL without slug', () => {
      expect(
        isFigmaUrl('https://www.figma.com/proto/LKQ4FJ4bTnCSjedbRpk931')
      ).toBe(true);
    });

    test('v2 design URL', () => {
      expect(
        isFigmaUrl(
          'https://embed.figma.com/design/LKQ4FJ4bTnCSjedbRpk931/Sample-File'
        )
      ).toBe(true);
    });

    test('v2 design URL with node-id', () => {
      expect(
        isFigmaUrl(
          'https://embed.figma.com/design/LKQ4FJ4bTnCSjedbRpk931/Sample-File?node-id=5-3'
        )
      ).toBe(true);
    });

    test('v2 proto URL', () => {
      expect(
        isFigmaUrl(
          'https://embed.figma.com/proto/LKQ4FJ4bTnCSjedbRpk931/Sample-Proto?node-id=5-3'
        )
      ).toBe(true);
    });

    test('v2 board URL', () => {
      expect(
        isFigmaUrl(
          'https://embed.figma.com/board/LKQ4FJ4bTnCSjedbRpk931/Sample-Board'
        )
      ).toBe(true);
    });

    test('v2 slides URL', () => {
      expect(
        isFigmaUrl(
          'https://embed.figma.com/slides/LKQ4FJ4bTnCSjedbRpk931/Sample-Slides'
        )
      ).toBe(true);
    });

    test('v2 deck URL', () => {
      expect(
        isFigmaUrl(
          'https://embed.figma.com/deck/LKQ4FJ4bTnCSjedbRpk931/Sample-Deck'
        )
      ).toBe(true);
    });

    test('ドット入りスラッグ（Embed-Kit-2.0-examples）', () => {
      expect(
        isFigmaUrl(
          'https://www.figma.com/file/nrPSsILSYjesyc5UHjYYa4/Embed-Kit-2.0-examples'
        )
      ).toBe(true);
    });

    test('v2 design URL with dot-containing slug', () => {
      expect(
        isFigmaUrl(
          'https://embed.figma.com/design/nrPSsILSYjesyc5UHjYYa4/Embed-Kit-2.0-examples?node-id=5-3'
        )
      ).toBe(true);
    });
  });

  describe('Falseを返す場合', () => {
    test('XSSを含んでいる', () => {
      const url = `https://www.figma.com/file/LKQ4FJ4bTnCSjedbRpk931/Sample-File"></iframe><img src onerror=alert(document.domain)>/`;
      expect(isFigmaUrl(url)).toBe(false);
    });

    test('不正なパス（bad-example）', () => {
      expect(
        isFigmaUrl(
          'https://www.figma.com/bad-example/file/LKQ4FJ4bTnCSjedbRpk931/Sample-File'
        )
      ).toBe(false);
    });

    test('http（非https）', () => {
      expect(
        isFigmaUrl(
          'http://www.figma.com/file/LKQ4FJ4bTnCSjedbRpk931/Sample-File'
        )
      ).toBe(false);
    });

    test('ファイルキーが短すぎる', () => {
      expect(
        isFigmaUrl('https://www.figma.com/file/short/Sample-File')
      ).toBe(false);
    });

    test('figma.com以外のドメイン', () => {
      expect(
        isFigmaUrl(
          'https://evil.com/file/LKQ4FJ4bTnCSjedbRpk931/Sample-File'
        )
      ).toBe(false);
    });
  });
});
