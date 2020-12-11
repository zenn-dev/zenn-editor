// plugis
import { md } from './md-utils';
import markdownItImSize from '@steelydylan/markdown-it-imsize';
import markdownItAnchor from 'markdown-it-anchor';
import { rendererFence } from './md-renderer-fence';
import markdownItPrism from './prism';
const mdContainer = require('markdown-it-container');

// options
import { mdContainerDetails, mdContainerMessage } from './md-container';
import { optionCustomBlock } from './md-custom-block';

md.use(markdownItPrism)
  .use(require('markdown-it-footnote'))
  .use(rendererFence)
  .use(markdownItImSize)
  .use(require('markdown-it-task-lists'), { enabled: true })
  .use(markdownItAnchor, { level: [1, 2, 3] })
  .use(require('markdown-it-inline-comments'))
  .use(require('markdown-it-link-attributes'), {
    pattern: /^(?!https:\/\/zenn\.dev\/)/,
    attrs: {
      rel: 'nofollow',
    },
  })
  .use(require('markdown-it-custom-block'), optionCustomBlock)
  .use(mdContainer, 'details', mdContainerDetails)
  .use(mdContainer, 'message', mdContainerMessage)
  .use(require('@catnose99/markdown-it-texmath'), {
    engine: require('katex'),
    delimiters: 'dollars',
    katexOptions: { macros: { '\\RR': '\\mathbb{R}' } },
  });

// custom footnote
md.renderer.rules.footnote_block_open = () =>
  '<section class="footnotes">\n' +
  '<div class="footnotes-title"><img src="https://twemoji.maxcdn.com/2/svg/1f58b.svg" class="emoji footnotes-twemoji" loading="lazy" width="20" height="20">脚注</div>\n' +
  '<ol class="footnotes-list">\n';

export default md;
