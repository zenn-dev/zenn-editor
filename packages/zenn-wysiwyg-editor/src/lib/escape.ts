// fork from https://github.com/markdown-it/markdown-it/blob/master/lib/common/utils.mjs

const HTML_ESCAPE_TEST_RE = /[&<>"]/;
const HTML_ESCAPE_REPLACE_RE = /[&<>"]/g;
const HTML_REPLACEMENTS = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
};

function replaceUnsafeChar(ch: string): string {
  return HTML_REPLACEMENTS[ch as keyof typeof HTML_REPLACEMENTS];
}

export function escapeHtml(str: string): string {
  if (HTML_ESCAPE_TEST_RE.test(str)) {
    return str.replace(HTML_ESCAPE_REPLACE_RE, replaceUnsafeChar);
  }
  return str;
}
