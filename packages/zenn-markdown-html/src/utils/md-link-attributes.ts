import MarkdownIt from 'markdown-it';

const markdownItLinkAttributes = require('markdown-it-link-attributes');

export function mdLinkAttributes(md: MarkdownIt) {
  // <a>タグの属性を設定する
  // Ref: https://github.com/crookedneighbor/markdown-it-link-attributes
  md.use(markdownItLinkAttributes, [
    // 内部リンク
    {
      matcher(href: string) {
        return href.match(/^(?:https:\/\/zenn\.dev$)|(?:https:\/\/zenn\.dev\/.*$)/);
      },
      attrs: {
        target: '_blank',
      },
    },
    // 外部リンク
    {
      matcher(href: string) {
        return href.match(/^https?:\/\//);
      },
      attrs: {
        target: '_blank',
        rel: 'nofollow noopener noreferrer',
      },
    },
  ]);
}
