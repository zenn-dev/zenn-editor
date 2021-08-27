import MarkdownIt from 'markdown-it';

// get langName supporting diff
// - `diff js` => `diff-js`
// - `js diff` => `js-diff`
// - `js` => `js`
function normalizeLangName(str: string) {
  return str
    .split(' ')
    .filter((lang) => !!lang)
    .join('-');
}

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
    // e.g. info = `js:fooBar.js`
    const langInfo = tokens[idx].info.split(/:/);
    const langName = langInfo?.length ? normalizeLangName(langInfo[0]) : '';

    if (langName === 'mermaid') {
      return `<div class="embed-mermaid"><embed-mermaid><pre class="zenn-mermaid">${md.utils.escapeHtml(
        tokens[idx].content.trim()
      )}</pre></embed-mermaid></div>`;
    }

    // Override info (e.g "js:fooBar.js" -> "js")
    // - This value is read by syntax highlighter.
    // - Should not pass unsupported langName such as `mermaid`,
    //   otherwise `Language does not exist` is shown on console.
    tokens[idx].info = langName;

    const originalHTML = defaultRender(...args);
    if (tokens[idx].content.length === 0) return originalHTML;

    // e.g `js:fooBar.js` => `fooBar.js`
    const labelText = langName.length && langInfo[1] ? langInfo[1] : null;

    return `
      <div class="code-block-container">
        ${
          labelText
            ? `<div class="code-block-filename-container"><span class="code-block-filename">${md.utils.escapeHtml(
                labelText
              )}</span></div>`
            : ''
        }
        ${originalHTML}
      </div>
      `;
  };
}
