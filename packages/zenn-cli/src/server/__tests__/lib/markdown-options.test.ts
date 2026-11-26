import { describe, expect, test } from 'vitest';
import { getMarkdownOptions } from '../../lib/markdown-options';

describe('getMarkdownOptions', () => {
  test('htmlEmbed を有効にする', () => {
    expect(getMarkdownOptions().htmlEmbed).toBe(true);
  });

  test('アップロードした音声の埋め込みを有効にする', () => {
    const options = getMarkdownOptions();

    expect(options.audioEmbed).toBe(true);
    expect(options.audioOrigins).toEqual(['https://user-upload.zenn.studio']);
  });
});
