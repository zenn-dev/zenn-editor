import MarkdownIt from 'markdown-it';

export function mdMermaid(md: MarkdownIt) {
  const defaultRender =
    md.renderer.rules.fence ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };
  md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
    const langInfo = tokens[idx];
    if (langInfo.info === 'mermaid') {
      const code = langInfo.content.trim();
      return `<div class="embed-mermaid"><embed-mermaid><pre class="zenn-mermaid">${md.utils.escapeHtml(
        code
      )}</pre></embed-mermaid></div>`;
    }
    return defaultRender(tokens, idx, options, env, slf);
  };
}
