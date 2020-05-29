// plugis
const md = require("markdown-it")({
  html: false,
  breaks: true,
  linkify: true,
});
const mdPrism = require("markdown-it-prism");
const mdLineHighlight = require("markdown-it-highlight-lines");
const mdContainer = require("markdown-it-container");
const mdAnchor = require("markdown-it-anchor");
const mdFootnote = require("markdown-it-footnote");
const mdImgNativeLazy = require("markdown-it-image-lazy-loading");

// containers
// ref: https://github.com/markdown-it/markdown-it-container

// ::: details Detail
//   summary comes here
// :::
const mdContainerDetails = {
  validate: function (params: string) {
    return params.trim().match(/^details\s+(.*)$/);
  },
  render: function (tokens: any[], idx: number) {
    const m = tokens[idx].info.trim().match(/^details\s+(.*)$/);
    if (tokens[idx].nesting === 1) {
      // opening tag
      return "<details><summary>" + md.utils.escapeHtml(m[1]) + "</summary>\n";
    } else {
      // closing tag
      return "</details>\n";
    }
  },
};
// ::: message alert
//   text
// :::
const mdContainerMessage = {
  validate: function (params: string) {
    return params.trim().match(/^msg\s+(.*)$/);
  },
  render: function (tokens: any[], idx: number) {
    const m = tokens[idx].info.trim().match(/^msg\s+(.*)$/);
    if (tokens[idx].nesting === 1) {
      // opening tag
      return '<div class="msg ' + md.utils.escapeHtml(m[1]) + '">';
    } else {
      // closing tag
      return "</div>\n";
    }
  },
};

md.use(mdPrism)
  .use(mdLineHighlight)
  .use(mdFootnote)
  .use(mdImgNativeLazy)
  .use(mdAnchor, { level: [1, 2, 3] })
  .use(mdContainer, "details", mdContainerDetails)
  .use(mdContainer, "message", mdContainerMessage);

// custom footnote
md.renderer.rules.footnote_block_open = () =>
  '<section class="footnotes">\n' +
  '<div class="footnotes-title"><img src="https://twemoji.maxcdn.com/2/svg/1f58b.svg" class="footnotes-twemoji" loading="lazy" width="20" height="20">脚注</div>\n' +
  '<ol class="footnotes-list">\n';

export default md;
