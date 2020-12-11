import MarkdownIt from 'markdown-it';

export function mdLinkifyClass(md: MarkdownIt) {
  // default renederer
  const defaultRender =
    md.renderer.rules.link_open ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

  // 自動リンクにクラスを付与
  md.renderer.rules.link_open = function (...args) {
    const [tokens, idx] = args;
    const token = tokens[idx];
    const isLinkified = token.markup === 'linkify';
    if (isLinkified) {
      token.attrJoin('class', 'linkified');
    }
    return defaultRender(...args);
  };
}
