/**
 * forked from https://github.com/tylingsoft/markdown-it-mermaid
 */
// import mermaid from 'mermaid';
import MarkdownIt from 'markdown-it';

function mermaidChart(code: string): string {
  // mermaid.parse(code);
  return `<embed-mermaid><div class="mermaid">${code}</div></embed-mermaid>`;
}

/**
 * ```merdmaid
 * ```
 * =>
 * <div class="mermaid"><pre></pre></div>
 * @param md
 */
export function mdMermaid(md: MarkdownIt) {
  // const temp = md.renderer.rules.fence.bind(md.renderer.rules);
  const defaultRender =
    md.renderer.rules.fence ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };
  md.renderer.rules.fence = (tokens, idx, options, env, slf) => {
    const langInfo = tokens[idx];
    if (langInfo.info === 'mermaid') {
      return mermaidChart(langInfo.content.trim());
    }
    return defaultRender(tokens, idx, options, env, slf);
  };
}
