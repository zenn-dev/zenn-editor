import type PrismJS from 'prismjs';

/**
 * 埋め込み要素の基本的なProps型
 */
export interface EmbedComponentProps {
  /** 親ウィンドウから渡されるID */
  id: string | null | undefined;
  /** ローディング中華のフラグ */
  isLoading: boolean;
  /** 親ウィンドウから渡されるURLやコンテンツ文字列 */
  src?: string;
  /** エラーが発生した時のエラーオブジェクト */
  error?: Error;
}

/**
 * PrismJS の tokenize() の戻り値の型
 */
export type PrismToken = string | PrismJS.Token;
