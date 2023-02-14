import type { EmbedGeneratorList } from './embed';

/**
 * Markdown 変換時のオプション型
 */
export type MarkdownOptions = {
  embedOrigin?: string;
  customEmbed?: Partial<EmbedGeneratorList>;
};
