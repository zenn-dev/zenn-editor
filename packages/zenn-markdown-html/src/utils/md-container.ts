import { escapeHtml } from './markdown-it-utils';
import type Token from 'markdown-it/lib/token.mjs';

// containers
// ref: https://github.com/markdown-it/markdown-it-container

// ::: details Detail
//   summary comes here
// :::
export const containerDetailsOptions = {
  validate: function (params: string) {
    return /^details\s+(.*)$/.test(params.trim());
  },
  render: function (tokens: Token[], idx: number) {
    const m = tokens[idx].info.trim().match(/^details\s+(.*)$/);
    const summary = m?.[1] || '';
    if (tokens[idx].nesting === 1) {
      // opening tag
      return (
        '<details><summary>' +
        escapeHtml(summary) +
        '</summary><div class="details-content">'
      );
    } else {
      // closing tag
      return '</div></details>\n';
    }
  },
};
// ::: message alert
//   text
// :::
const msgClassRegex = /^message\s*(alert)?$/;

export const containerMessageOptions = {
  validate: function (params: string) {
    return msgClassRegex.test(params.trim());
  },
  render: function (tokens: Token[], idx: number) {
    const m = tokens[idx].info.trim().match(msgClassRegex);
    const messageName = m?.[1] === 'alert' ? 'alert' : 'message';

    if (tokens[idx].nesting === 1) {
      // opening tag
      const symbol = `<span class="msg-symbol">!</span>`;
      return `<aside class="msg ${messageName}">${symbol}<div class="msg-content">`;
    } else {
      // closing tag
      return `</div></aside>\n`;
    }
  },
};
