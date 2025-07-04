import MarkdownIt from 'markdown-it';
import { RenderRule } from 'markdown-it/lib/renderer';

export const mdImage = (md: MarkdownIt): void => {
  const originalImageRenderRule = md.renderer.rules['image'] as RenderRule;

  md.renderer.rules.image = (tokens, idx, options, env, slf) => {
    const token = tokens[idx];

    token.attrSet('class', 'md-img');
    token.attrSet('loading', 'lazy');

    return originalImageRenderRule(tokens, idx, options, env, slf);
  };
};
