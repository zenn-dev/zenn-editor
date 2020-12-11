import markdownIt from 'markdown-it';
import { mdRendererFence } from './md-renderer-fence';
import { mdLinkifyClass } from './md-linkify-class';
import markdownItPrism from './prism';
const mdTexMath = require('@catnose99/markdown-it-texmath');

const mdBase = markdownIt({
  breaks: true,
  linkify: true,
});

mdBase.linkify.set({ fuzzyLink: false });
mdBase
  .use(markdownItPrism)
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

export { mdBase };

export const escapeHtml = mdBase.utils.escapeHtml;
