// plugis
import { mdBase as md } from './md-utils';

import {
  containerDetailsOptions,
  containerMessageOptions,
} from './md-container';
import { customBlockOptions } from './md-custom-block';

import markdownItImSize from '@steelydylan/markdown-it-imsize';
import markdownItAnchor from 'markdown-it-anchor';
const mdContainer = require('markdown-it-container');
const mdFootnote = require('markdown-it-footnote');
const mdTaskLists = require('markdown-it-task-lists');
const mdInlineComments = require('markdown-it-inline-comments');
const mdCustomBlock = require('markdown-it-custom-block');
const mdTexMath = require('@catnose99/markdown-it-texmath');

md.use(markdownItImSize)
  .use(markdownItAnchor, { level: [1, 2, 3] })
  .use(mdContainer, 'details', containerDetailsOptions)
  .use(mdContainer, 'message', containerMessageOptions)
  .use(mdFootnote)
  .use(mdTaskLists, { enabled: true })
  .use(mdInlineComments)
  .use(mdCustomBlock, customBlockOptions)
  .use(mdTexMath, {
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
