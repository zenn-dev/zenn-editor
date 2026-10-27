import { afterEach, describe, expect, test, vi } from 'vitest';
import { getMarkdownOptions } from '../../lib/markdown-options';

describe('getMarkdownOptions', () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  test('ZENN_EXPERIMENTAL_HTML_EMBED=1 のときだけ htmlEmbed を有効にする', () => {
    vi.stubEnv('ZENN_EXPERIMENTAL_HTML_EMBED', undefined);
    expect(getMarkdownOptions().htmlEmbed).toBe(false);

    vi.stubEnv('ZENN_EXPERIMENTAL_HTML_EMBED', 'true');
    expect(getMarkdownOptions().htmlEmbed).toBe(false);

    vi.stubEnv('ZENN_EXPERIMENTAL_HTML_EMBED', '1');
    expect(getMarkdownOptions().htmlEmbed).toBe(true);
  });
});
