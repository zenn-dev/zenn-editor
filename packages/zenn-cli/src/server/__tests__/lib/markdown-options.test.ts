import { describe, expect, test } from 'vitest';
import { getMarkdownOptions } from '../../lib/markdown-options';

describe('getMarkdownOptions', () => {
  test('htmlEmbed を有効にする', () => {
    expect(getMarkdownOptions().htmlEmbed).toBe(true);
  });
});
