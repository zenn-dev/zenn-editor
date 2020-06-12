// plugis
import { md } from "./md-base";
const mdContainer = require("markdown-it-container");

// options
import { mdContainerDetails, mdContainerMessage } from "./option-md-container";
import { optionCustomBlock } from "./option-md-custom-block";

md.use(require("markdown-it-prism"))
  .use(require("markdown-it-highlight-lines"))
  .use(require("markdown-it-footnote"))
  .use(require("markdown-it-image-lazy-loading"))
  .use(require("markdown-it-imsize"), { autofill: false })
  .use(require("markdown-it-anchor"), { level: [1, 2, 3] })
  .use(require("markdown-it-link-attributes"), {
    attrs: {
      target: "_blank",
      rel: "nofollow noreferrer noopener",
    },
  })
  .use(require("markdown-it-custom-block"), optionCustomBlock)
  .use(mdContainer, "details", mdContainerDetails)
  .use(mdContainer, "message", mdContainerMessage)
  .use(require("markdown-it-texmath"), {
    engine: require("katex"),
    delimiters: "dollars",
    katexOptions: { macros: { "\\RR": "\\mathbb{R}" } },
  });

// custom footnote
md.renderer.rules.footnote_block_open = () =>
  '<section class="footnotes">\n' +
  '<div class="footnotes-title"><img src="https://twemoji.maxcdn.com/2/svg/1f58b.svg" class="footnotes-twemoji" loading="lazy" width="20" height="20">脚注</div>\n' +
  '<ol class="footnotes-list">\n';

export default md;
