import markdownToHtml from 'zenn-markdown-html';

type MarkdownOptions = NonNullable<Parameters<typeof markdownToHtml>[1]>;

/** `zenn file upload --type audio` でアップロードした音声の配信元 */
const AUDIO_ORIGINS = ['https://user-upload.zenn.studio'];

/** プレビューで記事・チャプターを HTML に変換するときのオプションを返す */
export function getMarkdownOptions(): MarkdownOptions {
  return {
    embedOrigin: process.env.VITE_EMBED_SERVER_ORIGIN,
    htmlEmbed: true,
    audioEmbed: true,
    audioOrigins: AUDIO_ORIGINS,
    // `files` ディレクトリの音声（`@[audio](/files/…)`）は、プレビューサーバーが配信する
    audioLocalPaths: true,
  };
}
