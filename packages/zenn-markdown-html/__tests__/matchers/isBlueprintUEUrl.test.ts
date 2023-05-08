import { isBlueprintUEUrl } from '../../src/utils/url-matcher';

describe('Testing isBlueprintUEUrl', () => {
  describe('If True is returned', () => {
    test('When the embedded URL of blueprintUE', () => {
      const url = 'https://blueprintue.com/render/xmdvzpam/';
      expect(isBlueprintUEUrl(url)).toBe(true);
    });
  });

  describe('If False is returned', () => {
    test('should be contained XSS', () => {
      const url = `https://blueprintue.com/render/xmdvzpam/"></iframe><img src onerror=alert(document.domain)>/`;
      expect(isBlueprintUEUrl(url)).toBe(false);
    });
  });
});
