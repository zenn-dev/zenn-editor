import markdownToHtml from 'zenn-markdown-html';

type MarkdownOptions = NonNullable<Parameters<typeof markdownToHtml>[1]>;

/** プレビューで記事・チャプターを HTML に変換するときのオプションを返す */
export function getMarkdownOptions(): MarkdownOptions {
  return {
    embedOrigin: process.env.VITE_EMBED_SERVER_ORIGIN,
    htmlEmbed: true,
  };
}
