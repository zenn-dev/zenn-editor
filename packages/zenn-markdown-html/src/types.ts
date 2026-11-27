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
  /**
   * `@[audio](/files/…)` の相対パスを、`<audio>` の src にそのまま出力するか（デフォルト: false）
   * GitHub 連携のリポジトリや zenn-cli のプレビューで、`files` ディレクトリの音声を参照するために使う。
   * 出力するのは `/files/` から始まり `.m4a` で終わるパスだけで、`..` やクエリを含むパスは出力しない。
   * src には、セグメントごとにパーセントエンコードしたパス（ファイル名は NFC に正規化）を出力する。
   * 相対パスは呼び出し側で実際の URL に差し替えるか、配信する前提とする。
   * `audioEmbed` が false の場合は無視する
   */
  audioLocalPaths?: boolean;
};
