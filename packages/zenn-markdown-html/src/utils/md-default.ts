import MarkdownIt from 'markdown-it';

import { mdRendererFence } from './md-renderer-fence';
import { mdLinkifyClass } from './md-linkify-class';
import { mdPrism } from './md-prism';
const mdTexMath = require('@catnose99/markdown-it-texmath');

export function defaultPlugin(md: MarkdownIt) {
  md.linkify.set({ fuzzyLink: false });
  md.use(mdPrism)
    .use(mdRendererFence)
    .use(mdTexMath, {
      engine: require('katex'),
      delimiters: 'dollars',
      katexOptions: { macros: { '\\RR': '\\mathbb{R}' } },
    })
    .use(require('markdown-it-link-attributes'), {
      pattern: /^(?!https:\/\/zenn\.dev\/)/,
      attrs: {
        rel: 'nofollow',
      },
    })
    .use(mdLinkifyClass);
}
