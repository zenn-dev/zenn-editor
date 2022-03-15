import { escapeHtml } from 'markdown-it/lib/common/utils';
import type Token from 'markdown-it/lib/token';

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
      const icon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 101 101" role="img" aria-label="${messageName}" class="msg-icon"><circle cx="51" cy="51" r="50" fill="currentColor"></circle><text x="50%" y="50%" text-anchor="middle" fill="#ffffff" font-size="70" font-weight="bold" dominant-baseline="central">!</text></svg>`;
      return `<aside class="msg ${messageName}">${icon}<div class="msg-content">`;
    } else {
      // closing tag
      return `</div></aside>\n`;
    }
  },
};
