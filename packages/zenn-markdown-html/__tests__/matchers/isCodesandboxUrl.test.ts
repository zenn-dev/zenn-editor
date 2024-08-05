import { describe, test, expect } from 'vitest';
import { isCodesandboxUrl } from '../../src/utils/url-matcher';

describe('isCodesandboxUrlのテスト', () => {
  describe('Trueを返す場合', () => {
    test('Codesandboxの埋め込みURL', () => {
      const url = 'https://codesandbox.io/embed/new?view=Editor+%2B+Preview';

      expect(isCodesandboxUrl(url)).toBe(true);
    });
  });

  describe('Falseを返す場合', () => {
    test('XSSを含んでいる', () => {
      const url = `https://codesandbox.io/embed/new?view=Editor+%2B+Preview"></iframe><img src onerror=alert(document.domain)>/`;
      expect(isCodesandboxUrl(url)).toBe(false);
    });
  });
});
