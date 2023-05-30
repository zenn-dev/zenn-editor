import { isBlueprintUEUrl } from '../../src/utils/url-matcher';

describe('isBlueprintUEUrlのテスト', () => {
  describe('Trueを返す場合', () => {
    test('blueprintUEの埋め込みURL', () => {
      const url = 'https://blueprintue.com/render/xmdvzpam/';
      expect(isBlueprintUEUrl(url)).toBe(true);
    });
  });

  describe('Falseを返す場合', () => {
    test('XSSを含んでいる', () => {
      const url = `https://blueprintue.com/render/xmdvzpam/"></iframe><img src onerror=alert(document.domain)>/`;
      expect(isBlueprintUEUrl(url)).toBe(false);
    });
  });
});
