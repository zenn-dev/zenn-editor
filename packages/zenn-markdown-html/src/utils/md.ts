// plugis
import { md } from "./md-base";
const mdPrism = require("markdown-it-prism");
const mdLineHighlight = require("markdown-it-highlight-lines");
const mdContainer = require("markdown-it-container");
const mdAnchor = require("markdown-it-anchor");
const mdFootnote = require("markdown-it-footnote");
const mdImgNativeLazy = require("markdown-it-image-lazy-loading");
const mdImsize = require("markdown-it-imsize");
const mdLinkAttributes = require("markdown-it-link-attributes");
const mdCustomBlock = require("markdown-it-custom-block");

// options
import { mdContainerDetails, mdContainerMessage } from "./option-md-container";
import { optionCustomBlock } from "./option-md-custom-block";

md.use(mdPrism)
  .use(mdLineHighlight)
  .use(mdFootnote)
  .use(mdImgNativeLazy)
  .use(mdImsize, { autofill: false })
  .use(mdAnchor, { level: [1, 2, 3] })
  .use(mdLinkAttributes, {
    attrs: {
      target: "_blank",
      rel: "nofollow noreferrer noopener",
    },
  })
  .use(mdContainer, "details", mdContainerDetails)
  .use(mdContainer, "message", mdContainerMessage)
  .use(mdCustomBlock, optionCustomBlock);

// custom footnote
md.renderer.rules.footnote_block_open = () =>
  '<section class="footnotes">\n' +
  '<div class="footnotes-title"><img src="https://twemoji.maxcdn.com/2/svg/1f58b.svg" class="footnotes-twemoji" loading="lazy" width="20" height="20">脚注</div>\n' +
  '<ol class="footnotes-list">\n';

export default md;
