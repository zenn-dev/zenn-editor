import markdownIt from 'markdown-it';
import crypto from 'crypto';

// plugis
import {
  containerDetailsOptions,
  containerMessageOptions,
} from './utils/md-container';
import { mdRendererFence } from './utils/md-renderer-fence';
import { mdLinkAttributes } from './utils/md-link-attributes';
import { mdLinkifyToCard } from './utils/md-linkify-to-card';
import { mdKatex } from './utils/md-katex';
import { mdBr } from './utils/md-br';
import { mdCustomBlock } from './utils/md-custom-block';
import markdownItImSize from '@steelydylan/markdown-it-imsize';
import markdownItAnchor from 'markdown-it-anchor';

const mdContainer = require('markdown-it-container');
const mdFootnote = require('markdown-it-footnote');
const mdTaskLists = require('markdown-it-task-lists');
const mdInlineComments = require('markdown-it-inline-comments');

const md = markdownIt({
  breaks: true,
  linkify: true,
});

md.linkify.set({ fuzzyLink: false });

md.use(mdBr)
  .use(mdRendererFence)
  .use(markdownItImSize)
  .use(mdCustomBlock)
  .use(mdContainer, 'details', containerDetailsOptions)
  .use(mdContainer, 'message', containerMessageOptions)
  .use(mdFootnote)
  .use(mdTaskLists, { enabled: true })
  .use(mdInlineComments)
  .use(mdLinkAttributes)
  .use(markdownItAnchor, {
    level: [1, 2, 3, 4],
    permalink: markdownItAnchor.permalink.ariaHidden({
      placement: 'before',
      class: 'header-anchor-link',
      symbol: '',
    }),
    tabIndex: false,
  })
  .use(mdKatex)
  .use(mdLinkifyToCard);

// custom footnote
md.renderer.rules.footnote_block_open = () =>
  '<section class="footnotes">\n' +
  '<div class="footnotes-title">脚注</div>\n' +
  '<ol class="footnotes-list">\n';

const markdownToHtml = (text: string): string => {
  if (!(text && text.length)) return '';

  // docIdは複数のコメントが1ページに指定されたときに脚注のリンク先が重複しないように指定する
  // 1ページの中で重複しなければ問題ないため、ごく短いランダムな文字列とする
  // - https://github.com/zenn-dev/zenn-community/issues/356
  // - https://github.com/markdown-it/markdown-it-footnote/pull/8
  const docId = crypto.randomBytes(2).toString('hex');
  return md.render(text, { docId });
};

export default markdownToHtml;

import { markdownToSimpleHtml } from './markdown-to-simple-html';
export { markdownToSimpleHtml };
