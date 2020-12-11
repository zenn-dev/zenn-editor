import MarkdownIt from 'markdown-it';

const md: MarkdownIt = require('markdown-it')({
  breaks: true,
  linkify: true,
});
md.linkify.set({ fuzzyLink: false });
export { md };

export const escapeHtml = md.utils.escapeHtml;
