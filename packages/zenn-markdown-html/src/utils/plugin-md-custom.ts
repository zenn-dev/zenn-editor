import MarkdownIt from "markdown-it";
import { escapeHtml } from "markdown-it/lib/common/utils";

export function customRendererFence(md: MarkdownIt) {
  // default renederer
  const defaultRender =
    md.renderer.rules.fence ||
    function (tokens, idx, options, env, self) {
      return self.renderToken(tokens, idx, options);
    };

  // override fence
  md.renderer.rules.fence = function (...args) {
    const [tokens, idx] = args;
    // e.g. info = "js:fooBar.js"
    const langInfo = tokens[idx].info.split(/:/);
    const langName = langInfo?.length ? langInfo[0].trim() : ""; // e.g "js"
    const filename = langName.length && langInfo[1] ? langInfo[1] : ""; // e.g "fooBar.js"

    // override info (e.g "js:fooBar.js" to "js")
    tokens[idx].info = langName;
    const originalHTML = defaultRender(...args);
    if (tokens[idx].content.length === 0) return originalHTML;

    return `
      <div class="code-block-container">
          <span class="code-filename">${escapeHtml(filename)}</span>
        ${originalHTML}
      </div>
      `;
  };
}