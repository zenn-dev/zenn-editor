// コメントでは一部のHTMLのみ許可する
const commentMd = require("markdown-it")({
  breaks: true,
  linkify: true,
});

commentMd
  .disable(["link", "image", "table", "heading"])
  .use(require("markdown-it-prism"))
  .use(require("markdown-it-link-attributes"), {
    attrs: {
      target: "_blank",
      rel: "nofollow noreferrer noopener",
    },
  });

export default commentMd;
