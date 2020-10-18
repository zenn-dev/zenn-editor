export const md = require("markdown-it")({
  breaks: true,
  linkify: true,
});
md.linkify.set({ fuzzyLink: false });
export const escapeHtml = md.utils.escapeHtml;
