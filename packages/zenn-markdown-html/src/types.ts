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
  /**
   * `@[audio](URL)` を `<audio>` として表示するか（デフォルト: false）
   * false の場合は、音声を再生せず URL へのリンクとして出力する
   */
  audioEmbed?: boolean;
  /**
   * `@[audio](URL)` で埋め込みを許可する音声の配信元（デフォルト: なし）
   * オリジン（例: `https://audio.example.com`）、またはオリジンとパスの接頭辞
   * （例: `https://example.com/uploads`）を指定する。
   * 埋め込めるのは `<配信元>/audio/<32桁の16進数（小文字）>.m4a` の形の URL だけで、
   * クエリやフラグメントが付いた URL は埋め込まない。
   * `audioEmbed` を有効にしても、ここに配信元を指定しなければ音声は埋め込まれない
   */
  audioOrigins?: readonly string[];
};
