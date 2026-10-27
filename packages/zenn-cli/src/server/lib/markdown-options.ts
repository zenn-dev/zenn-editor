import markdownToHtml from 'zenn-markdown-html';
import { runtimeEnv } from './runtime-env';

type MarkdownOptions = NonNullable<Parameters<typeof markdownToHtml>[1]>;

/** プレビューで記事・チャプターを HTML に変換するときのオプションを返す */
export function getMarkdownOptions(): MarkdownOptions {
  return {
    embedOrigin: process.env.VITE_EMBED_SERVER_ORIGIN,
    // 実験的な機能のため、環境変数で明示的に有効にしたときだけ使う
    htmlEmbed: runtimeEnv('ZENN_EXPERIMENTAL_HTML_EMBED') === '1',
  };
}
