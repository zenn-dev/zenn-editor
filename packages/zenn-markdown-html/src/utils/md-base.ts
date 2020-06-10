export const md = require("markdown-it")({
  breaks: true,
  linkify: true,
});
export const escapeHtml = md.utils.escapeHtml;
