import { describe, expect, test } from 'vitest';
import markdownToHtml from 'zenn-markdown-html';
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

  test('アップロードした音声のURLを <audio /> に変換できる', async () => {
    const url =
      'https://user-upload.zenn.studio/audio/0123456789abcdef0123456789abcdef.m4a';
    const html = await markdownToHtml(`@[audio](${url})`, getMarkdownOptions());

    expect(html).toContain(`<audio controls preload="metadata" src="${url}">`);
  });

  test('files ディレクトリの音声のパスを <audio /> に変換できる', async () => {
    expect(getMarkdownOptions().audioLocalPaths).toBe(true);

    const html = await markdownToHtml(
      '@[audio](/files/intro.m4a)',
      getMarkdownOptions()
    );

    expect(html).toContain(
      '<audio controls preload="metadata" src="/files/intro.m4a">'
    );
  });
});
