const mdPrism = require("markdown-it-prism");
const md = require("markdown-it")({
  html: false,
  breaks: true,
  linkify: true,
}).use(mdPrism);

const markdownToHtml = (text: string): string => {
  if (!(text && text.length)) return text;
  return md.render(text);
};

export default markdownToHtml;
