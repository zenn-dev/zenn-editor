import MarkdownIt from "markdown-it";

/**
 * Adds begin line index to the output via the 'data-line' data attribute.
 *
 * Ref: https://github.com/microsoft/vscode/blob/84f63bf4e54c60e40865c8c4d8002893a337fe61/extensions/markdown-language-features/src/markdownEngine.ts#L17-L40
 */
export function mdSourceMap(md: MarkdownIt): void {
  // Set the attribute on every possible token.
  md.core.ruler.push("source_map_data_attribute", (state): void => {
    for (const token of state.tokens) {
      if (token.map && token.type !== "inline") {
        token.attrSet("data-line", String(token.map[0]));
        token.attrJoin("class", "code-line");
      }
    }
  });
}
