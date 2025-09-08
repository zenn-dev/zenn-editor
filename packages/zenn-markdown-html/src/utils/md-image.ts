import MarkdownIt from 'markdown-it';
import { RenderRule } from 'markdown-it/lib/renderer.js'; // ファイル解決はESM読み込み時に拡張子が必要

export const mdImage = (md: MarkdownIt): void => {
  const originalImageRenderRule = md.renderer.rules['image'] as RenderRule;

  md.renderer.rules.image = (tokens, idx, options, env, slf) => {
    const token = tokens[idx];

    token.attrJoin('class', 'md-img');
    token.attrSet('loading', 'lazy');

    return originalImageRenderRule(tokens, idx, options, env, slf);
  };
};
