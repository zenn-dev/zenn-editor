import { afterEach, describe, expect, test } from 'vitest';
import { getMarkdownOptions } from '../../lib/markdown-options';

describe('getMarkdownOptions', () => {
  afterEach(() => {
    delete process.env.ZENN_EXPERIMENTAL_HTML_EMBED;
  });

  test('ZENN_EXPERIMENTAL_HTML_EMBED=1 のときだけ htmlEmbed を有効にする', () => {
    expect(getMarkdownOptions().htmlEmbed).toBe(false);

    process.env.ZENN_EXPERIMENTAL_HTML_EMBED = 'true';
    expect(getMarkdownOptions().htmlEmbed).toBe(false);

    process.env.ZENN_EXPERIMENTAL_HTML_EMBED = '1';
    expect(getMarkdownOptions().htmlEmbed).toBe(true);
  });
});
