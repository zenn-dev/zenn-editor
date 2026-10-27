import type { EmbedGeneratorList } from './embed';

/**
 * Markdown 変換時のオプション型
 */
export type MarkdownOptions = {
  embedOrigin?: string;
  customEmbed?: Partial<EmbedGeneratorList>;
  /**
   * `html-embed` のコードブロックを埋め込みサーバーの iframe で表示するか（デフォルト: false）
   * false の場合や `embedOrigin` が未設定の場合は、HTML のコードブロックとして出力する
   */
  htmlEmbed?: boolean;
};
