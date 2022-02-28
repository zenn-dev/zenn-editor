import { ValidateResult } from './types';

/**
 * レンダリングする図ごとの最大文字数
 */
const MAX_CHAR_LIMIT = 2000;

/**
 * フローチャートのチェイン数制限
 * ```
 * graph LR
 *    a --> b & c--> d
 * ```
 * に対応するが、少ない記述でノード接続が爆発する可能性があるため最大数を制限する
 * @reference https://mermaid-js.github.io/mermaid/#/flowchart?id=chaining-of-links
 */
const MAX_CHAINING_OF_LINKS_LIMIT = 10;

/**
 * コンポーネント側でもつデフォルトの設定
 */
export const DEFAULT_CONFIG = {
  startOnLoad: true, // 読み込み時にレンダリング
  securityLevel: 'strict', // tags in text are encoded, click functionality is disabled
  theme: 'default',
  er: {
    useMaxWidth: true,
  },
  flowchart: {
    useMaxWidth: true, // 表示の都合上見切れるのもスクロールするのも嫌なので最大幅を有効にする
    htmlLabels: false, // セキュリティのため、HTMLラベルは許可しない
  },
  sequence: {
    useMaxWidth: true,
  },
  class: {
    useMaxWidth: true,
  },
  journey: {
    useMaxWidth: true,
  },
};

/**
 * mermaidのソース文字列を検証する
 * @param source mermaidのソース文字列
 */
export function validateMermaidSource(source: string): ValidateResult {
  return {
    charLimitOver: {
      hasError: source.length > MAX_CHAR_LIMIT,
      message: `ブロックあたりの文字数上限は${MAX_CHAR_LIMIT}です`,
    },
    chainingOfLinksOver: {
      hasError: (source.match(/&/g) || []).length > MAX_CHAINING_OF_LINKS_LIMIT,
      message: `ブロックあたりの & によるチェイン上限は${MAX_CHAINING_OF_LINKS_LIMIT}です`,
    },
  };
}
