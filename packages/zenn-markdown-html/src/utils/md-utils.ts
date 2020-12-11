import MarkdownIt from 'markdown-it';
import { mdRendererFence } from './md-renderer-fence';
import { mdLinkifyClass } from './md-linkify-class';
import markdownItPrism from './prism';

const mdBase: MarkdownIt = require('markdown-it')({
  breaks: true,
  linkify: true,
});
mdBase.linkify.set({ fuzzyLink: false });
mdBase
  .use(markdownItPrism)
  .use(mdRendererFence)
  .use(require('markdown-it-link-attributes'), {
    pattern: /^(?!https:\/\/zenn\.dev\/)/,
    attrs: {
      rel: 'nofollow',
    },
  })
  .use(mdLinkifyClass);
export { mdBase };

export const escapeHtml = mdBase.utils.escapeHtml;
