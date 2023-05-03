import { isFigmaUrl } from '../../src/utils/url-matcher';

describe('Testing isFigmaUrl', () => {
  describe('If True is returned', () => {
    test('When the embedded URL of Figma', () => {
      const url =
        'https://www.figma.com/file/LKQ4FJ4bTnCSjedbRpk931/Sample-File';

      expect(isFigmaUrl(url)).toBe(true);
    });
  });

  describe('If False is returned', () => {
    test('should be contained XSS', () => {
      const url = `https://www.figma.com/file/LKQ4FJ4bTnCSjedbRpk931/Sample-File"></iframe><img src onerror=alert(document.domain)>/`;
      expect(isFigmaUrl(url)).toBe(false);
    });
  });
});
