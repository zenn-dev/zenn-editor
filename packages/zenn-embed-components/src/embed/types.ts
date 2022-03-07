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
 * GistのAPIから取得した<div />とcssの文字列
 */
export type GistApiResponse = {
  div: string;
  stylesheet: string;
};

/**
 * PrismJS の tokenize() の戻り値の型
 */
export type PrismToken = string | PrismJS.Token;

/**
 * リンク情報のデータ型
 */
export interface LinkData {
  url: string;
  title: string;
  hostname: string;
  urlOrigin?: string;
  imageUrl?: string;
  description?: string;
  shouldNofollow?: boolean;
}

/**
 * Githubリポジトリのデータ型
 */
export interface GithubRepoData {
  url: string;
  name: string;
  owner: string;
  fullName: string;
  language?: string;
  forksCount?: number;
  description?: string;
  stargazersCount?: number;
}

/**
 * Mermaidのエラー型
 */
export type MermaidErrorContainer = {
  hasError: boolean;
  message: string;
};

/**
 * Mermaid文字列の検証結果の型
 */
export type MermaidValidateResult = {
  charLimitOver: MermaidErrorContainer;
  chainingOfLinksOver: MermaidErrorContainer;
};
