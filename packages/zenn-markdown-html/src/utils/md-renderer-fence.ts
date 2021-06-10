import MarkdownIt from 'markdown-it';
import { extractFenceInfo } from './helper';

export function mdRendererFence(md: MarkdownIt) {
  // default renederer
  const defaultRender =
    md.renderer.rules.fence ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

  // override fence
  md.renderer.rules.fence = function (...args) {
    const [tokens, idx] = args;
    const { fileName: filename, langName, content } = extractFenceInfo(
      tokens,
      idx
    );

    // override info (e.g "js:fooBar.js" -> "js")
    tokens[idx].info = langName;
    const originalHTML = defaultRender(...args);
    if (content.length === 0) return originalHTML;

    const filenameHTML = filename
      ? `<div class="code-block-filename-container"><span class="code-block-filename">${md.utils.escapeHtml(
          filename
        )}</span></div>`
      : '';

    return `
      <div class="code-block-container">
        ${filenameHTML}
        ${originalHTML}
      </div>
      `;
  };
}
