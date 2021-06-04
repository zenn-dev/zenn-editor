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
      return `<embed-mermaid><pre class="zenn-mermaid">${code}</pre></embed-mermaid>`;
    }
    return defaultRender(tokens, idx, options, env, slf);
  };
}
