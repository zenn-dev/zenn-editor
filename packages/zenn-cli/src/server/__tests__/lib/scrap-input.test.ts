import { describe, expect, test } from 'vitest';
import { parseScrapSlugOrUrl, ScrapInputError } from '../../lib/scrap-input';

describe('Scrap入力', () => {
  test('slugと許可されたScrap URLをslugへ正規化する', () => {
    expect(parseScrapSlugOrUrl('abcdef123456')).toBe('abcdef123456');
    expect(
      parseScrapSlugOrUrl('https://zenn.dev/example/scraps/abcdef123456')
    ).toBe('abcdef123456');
    expect(
      parseScrapSlugOrUrl(
        'http://localhost:3000/example/scraps/abcdef123456',
        'http://localhost:3000'
      )
    ).toBe('abcdef123456');
  });

  test.each([
    'short',
    'https://example.com/example/scraps/abcdef123456',
    'https://zenn.dev/example/articles/abcdef123456',
    'https://zenn.dev/example/scraps/invalid/slash',
  ])('無効な入力を拒否する: %s', (value) => {
    expect(() => parseScrapSlugOrUrl(value)).toThrow(ScrapInputError);
  });
});
