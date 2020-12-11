import MarkdownIt from 'markdown-it';
import { RenderRule } from 'markdown-it/lib/renderer';

const injectLineNumbers: RenderRule = (tokens, idx, options, env, slf) => {
  let line;
  if (tokens[idx] && tokens[idx].map && tokens[idx].level === 0) {
    line = (tokens[idx].map as [number, number])[0];
    tokens[idx].attrJoin('class', 'line');
    tokens[idx].attrSet('data-line', String(line));
  }
  return slf.renderToken(tokens, idx, options);
};

export const mdLineNumber = (md: MarkdownIt) => {
  md.renderer.rules.paragraph_open = md.renderer.rules.heading_open = injectLineNumbers;
  return md;
};
