/* 埋め込み要素の種別 */
export type EmbedType =
  | 'youtube'
  | 'slideshare'
  | 'speakerdeck'
  | 'jsfiddle'
  | 'docswell'
  | 'codepen'
  | 'codesandbox'
  | 'stackblitz'
  | 'tweet'
  | 'blueprintue'
  | 'figma'
  | 'card'
  | 'gist'
  | 'github'
  | 'mermaid';

/** embedサーバーで表示する埋め込み要素の種別 */
export type EmbedServerType = Extract<
  EmbedType,
  'tweet' | 'card' | 'mermaid' | 'github' | 'gist'
>;

export type SpeakerDeckEmbedResponse = {
  embedId: string;
  slideIndex?: number | null;
};
