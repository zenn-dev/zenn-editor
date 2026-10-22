import type { MarkdownIt, RendererRule } from 'markdown-it';

export const mdImage = (md: MarkdownIt): void => {
  const originalImageRenderRule = md.renderer.rules['image'] as RendererRule;

  md.renderer.rules.image = (tokens, idx, options, env, slf) => {
    const token = tokens[idx];

    token.attrJoin('class', 'md-img');
    token.attrSet('loading', 'lazy');

    return originalImageRenderRule(tokens, idx, options, env, slf);
  };
};
