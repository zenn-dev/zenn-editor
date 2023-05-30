import { isFigmaUrl } from '../../src/utils/url-matcher';

describe('isFigmaUrlのテスト', () => {
  describe('Trueを返す場合', () => {
    test('Figmaの埋め込みURL', () => {
      const url =
        'https://www.figma.com/file/LKQ4FJ4bTnCSjedbRpk931/Sample-File';

      expect(isFigmaUrl(url)).toBe(true);
    });
  });

  describe('Falseを返す場合', () => {
    test('XSSを含んでいる', () => {
      const url = `https://www.figma.com/file/LKQ4FJ4bTnCSjedbRpk931/Sample-File"></iframe><img src onerror=alert(document.domain)>/`;
      expect(isFigmaUrl(url)).toBe(false);
    });
  });
});
