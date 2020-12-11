import { md as commentMd } from './md-utils';
import markdownItPrism from './prism';

// コメントでは一部のHTMLのみ許可する
import { rendererFence } from './md-renderer-fence';

commentMd
  .use(markdownItPrism)
  .use(rendererFence)
  .use(require('markdown-it-link-attributes'), {
    pattern: /^(?!https:\/\/zenn\.dev\/)/,
    attrs: {
      target: '_blank',
      rel: 'nofollow noreferrer noopener',
    },
  })
  .disable(['image', 'table', 'heading']);

export default commentMd;
