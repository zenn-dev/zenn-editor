export const md = require("markdown-it")({
  html: false,
  breaks: true,
  linkify: true,
});

export const escapeHtml = md.utils.escapeHtml;
