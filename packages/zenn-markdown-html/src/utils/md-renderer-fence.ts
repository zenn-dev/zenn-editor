import MarkdownIt from 'markdown-it';

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
    // e.g. info = "js:fooBar.js"
    const langInfo = tokens[idx].info.split(/:/);
    // e.g. diff js => diff-js, js diff => js-diff js => js
    const langName = langInfo?.length
      ? langInfo[0]
          .split(' ')
          .filter((lang) => !!lang)
          .join('-')
      : '';
    const filename = langName.length && langInfo[1] ? langInfo[1] : null; // e.g "fooBar.js"

    // override info (e.g "js:fooBar.js" -> "js")
    tokens[idx].info = langName;
    const originalHTML = defaultRender(...args);
    if (tokens[idx].content.length === 0) return originalHTML;

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
